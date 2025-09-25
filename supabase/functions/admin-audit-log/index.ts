import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    console.log('🔍 [AUDIT-LOG] Admin audit log request received');

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
      console.error('❌ [AUDIT-LOG] Authentication failed:', userError);
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Admin emails check
    const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') ?? '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    if (ADMIN_EMAILS.length === 0) {
      console.error('❌ [AUDIT-LOG] No admin emails configured');
      return new Response('Admin emails not configured', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      console.error(`❌ [AUDIT-LOG] User ${user.email} is not an admin`);
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    console.log(`✅ [AUDIT-LOG] Admin access verified for: ${user.email}`);
    
    const url = new URL(req.url);
    const userFilter = url.searchParams.get('user_filter') || '';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const eventType = url.searchParams.get('event_type') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const cursor = url.searchParams.get('cursor');
    
    // Parse cursor for pagination
    let cursorDate: string | null = null;
    let cursorId: string | null = null;
    if (cursor) {
      const parts = cursor.split('|');
      if (parts.length === 2) {
        cursorDate = parts[0];
        cursorId = parts[1];
      }
    }

    console.log('🔍 [AUDIT-LOG] Filters:', { userFilter, startDate, endDate, eventType, limit });

    // Build queries with proper two-key ordering for stable pagination
    let combinedData: any[] = [];

    if (eventType === 'all' || eventType === 'transactions') {
      let transactionQuery = supabaseAdmin
        .from('billing_transactions')
        .select(`
          transaction_id as id,
          user_id,
          type,
          amount_usd,
          credits_purchased,
          provider,
          created_at
        `)
        .order('created_at', { ascending: false })
        .order('transaction_id', { ascending: false })
        .limit(limit);

      if (userFilter) {
        transactionQuery = transactionQuery.or(`user_id.eq.${userFilter}`);
      }
      if (startDate) {
        transactionQuery = transactionQuery.gte('created_at', startDate);
      }
      if (endDate) {
        transactionQuery = transactionQuery.lte('created_at', endDate);
      }
      
      // Apply cursor pagination with OR filter
      if (cursorDate && cursorId) {
        const cursorFilter = `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},transaction_id.lt.${cursorId})`;
        transactionQuery = transactionQuery.or(cursorFilter);
      }

      const { data: transactions, error: transError } = await transactionQuery;
      if (transError) {
        console.error('❌ [AUDIT-LOG] Transaction query error:', transError);
      } else {
        combinedData.push(...(transactions || []).map(t => ({
          ...(t as unknown as Record<string, unknown>),
          source_table: 'transaction' as const,
          user_email: '', // Will be filled later
          status: null,
          metadata: null
        })));
      }
    }

    if (eventType === 'all' || eventType === 'adjustments') {
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
          created_at
        `)
        .order('created_at', { ascending: false })
        .order('ledger_id', { ascending: false })
        .limit(limit);

      if (userFilter) {
        ledgerQuery = ledgerQuery.or(`user_id.eq.${userFilter}`);
      }
      if (startDate) {
        ledgerQuery = ledgerQuery.gte('created_at', startDate);
      }
      if (endDate) {
        ledgerQuery = ledgerQuery.lte('created_at', endDate);
      }
      
      // Apply cursor pagination with OR filter
      if (cursorDate && cursorId) {
        const cursorFilter = `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},ledger_id.lt.${cursorId})`;
        ledgerQuery = ledgerQuery.or(cursorFilter);
      }

      const { data: ledger, error: ledgerError } = await ledgerQuery;
      if (ledgerError) {
        console.error('❌ [AUDIT-LOG] Ledger query error:', ledgerError);
      } else {
        combinedData.push(...(ledger || []).map(l => ({
          ...(l as unknown as Record<string, unknown>),
          source_table: 'ledger' as const,
          user_email: '', // Will be filled later
          amount_usd: null,
          credits_purchased: null,
          provider: null
        })));
      }
    }

    // Sort combined data by created_at desc, then by id for stable pagination
    combinedData.sort((a, b) => {
      const dateCompare = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });
    
    // Limit results and generate next cursor
    const limitedResults = combinedData.slice(0, limit);
    const hasMore = combinedData.length > limit;
    
    let nextCursor: string | null = null;
    if (hasMore && limitedResults.length > 0) {
      const lastItem = limitedResults[limitedResults.length - 1];
      nextCursor = `${lastItem.created_at}|${lastItem.id}`;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [AUDIT-LOG] Retrieved ${combinedData.length} audit records in ${duration}ms`);
    
    return new Response(
      JSON.stringify({ 
        data: limitedResults,
        next_cursor: nextCursor,
        has_more: hasMore
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [AUDIT] Error:', error);
    
    // Handle session errors specifically  
    if (error.message === 'NO_SESSION' || error.message?.includes('JWT')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});