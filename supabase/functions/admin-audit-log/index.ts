import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 [AUDIT] Admin audit log request received');

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ [AUDIT] Authentication failed:', userError);
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Admin emails check
    const ADMIN_EMAILS = Deno.env.get('ADMIN_EMAILS')?.split(',').map(s => s.trim().toLowerCase()) ?? [
      "cumbucotrader@gmail.com", 
      "scott@sparkwave-ai.com"
    ];

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
      console.error(`❌ [AUDIT] User ${user.email} is not an admin`);
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    console.log(`✅ [AUDIT] Admin access verified for: ${user.email}`);

    // Parse query parameters
    const url = new URL(req.url);
    const userFilter = url.searchParams.get('user_filter') || '';
    const startDate = url.searchParams.get('start_date') || '';
    const endDate = url.searchParams.get('end_date') || '';
    const eventType = url.searchParams.get('event_type') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    console.log('🔍 [AUDIT] Filters:', { userFilter, startDate, endDate, eventType, limit });

    // Build queries for both tables
    let transactionsQuery = supabaseAdmin
      .from('billing_transactions')
      .select(`
        transaction_id as id,
        user_id,
        type,
        amount_usd,
        credits_purchased,
        provider,
        provider_ref,
        created_at,
        'transaction' as source_table
      `)
      .order('created_at', { ascending: false });

    let ledgerQuery = supabaseAdmin
      .from('billing_credit_ledger')
      .select(`
        ledger_id as id,
        user_id,
        action_type as type,
        credits_delta,
        source,
        status,
        metadata,
        created_at,
        'ledger' as source_table
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (userFilter) {
    // For user filter, we need to handle both email and user_id
        if (userFilter.includes('@')) {
          // It's an email, need to get user_id first - limit results and require minimum length
          if (userFilter.length < 3) {
            return new Response(JSON.stringify({ 
              error: 'Email filter too short',
              message: 'Email filter must be at least 3 characters'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          const { data: userProfiles } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 20
          });
          const matchingUser = userProfiles?.users.find(u => 
            u.email?.toLowerCase().includes(userFilter.toLowerCase())
          );
        if (matchingUser) {
          transactionsQuery = transactionsQuery.eq('user_id', matchingUser.id);
          ledgerQuery = ledgerQuery.eq('user_id', matchingUser.id);
        } else {
          // No matching user found, return empty results
          return new Response(JSON.stringify({ data: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else {
        // Assume it's a user_id
        transactionsQuery = transactionsQuery.eq('user_id', userFilter);
        ledgerQuery = ledgerQuery.eq('user_id', userFilter);
      }
    }

    if (startDate) {
      transactionsQuery = transactionsQuery.gte('created_at', startDate);
      ledgerQuery = ledgerQuery.gte('created_at', startDate);
    }

    if (endDate) {
      transactionsQuery = transactionsQuery.lte('created_at', endDate);
      ledgerQuery = ledgerQuery.lte('created_at', endDate);
    }

    // Apply event type filter
    if (eventType !== 'all') {
      if (eventType === 'transactions') {
        ledgerQuery = ledgerQuery.limit(0); // Exclude ledger
      } else if (eventType === 'adjustments') {
        transactionsQuery = transactionsQuery.limit(0); // Exclude transactions
        ledgerQuery = ledgerQuery.eq('source', 'admin_adjustment');
      } else {
        // Specific transaction type
        transactionsQuery = transactionsQuery.eq('type', eventType);
        ledgerQuery = ledgerQuery.limit(0); // Exclude ledger
      }
    }

    // Apply limits
    transactionsQuery = transactionsQuery.limit(Math.min(limit, 500));
    ledgerQuery = ledgerQuery.limit(Math.min(limit, 500));

    // Execute queries
    const [transactionsResult, ledgerResult] = await Promise.all([
      transactionsQuery,
      ledgerQuery
    ]);

    if (transactionsResult.error) {
      console.error('❌ [AUDIT] Transactions query error:', transactionsResult.error);
      throw transactionsResult.error;
    }

    if (ledgerResult.error) {
      console.error('❌ [AUDIT] Ledger query error:', ledgerResult.error);
      throw ledgerResult.error;
    }

    // Combine and sort results
    const combinedData = [
      ...(transactionsResult.data || []),
      ...(ledgerResult.data || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, limit);

    // Get user emails for the results
    const userIds = [...new Set(combinedData.map(item => item.user_id))];
    const { data: userProfiles } = await supabaseAdmin.auth.admin.listUsers();
    const userEmailMap = {};
    userProfiles?.users.forEach(user => {
      if (userIds.includes(user.id)) {
        userEmailMap[user.id] = user.email;
      }
    });

    // Enrich data with user emails
    const enrichedData = combinedData.map(item => ({
      ...item,
      user_email: userEmailMap[item.user_id] || 'Unknown'
    }));

    console.log(`✅ [AUDIT] Retrieved ${enrichedData.length} audit records`);

    return new Response(JSON.stringify({ data: enrichedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [AUDIT] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});