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
    console.log('📊 [STATS] Admin billing stats request received');

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
      console.error('❌ [STATS] Authentication failed:', userError);
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
      console.error(`❌ [STATS] User ${user.email} is not an admin`);
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    console.log(`📊 [STATS] Fetching stats for last ${days} days`);

    // 1. Summary Stats Queries
    const summaryQueries = await Promise.all([
      // Credits granted this period (from ledger + transactions)
      supabaseAdmin
        .from('billing_credit_ledger')
        .select('credits_delta')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .gt('credits_delta', 0),
        
      supabaseAdmin
        .from('billing_transactions')
        .select('credits_purchased')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('credits_purchased', 'is', null),

      // Credits consumed this period
      supabaseAdmin
        .from('billing_usage_log')
        .select('credits_spent')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),

      // Active subscriptions
      supabaseAdmin
        .from('billing_profiles')
        .select('user_id, plan_id, renewal_date, auto_renew')
        .eq('auto_renew', true)
        .gte('renewal_date', new Date().toISOString())
    ]);

    const [ledgerCredits, transactionCredits, usageData, activeSubscriptions] = summaryQueries;

    // Calculate summary metrics
    const creditsGranted = 
      (ledgerCredits.data?.reduce((sum, item) => sum + item.credits_delta, 0) || 0) +
      (transactionCredits.data?.reduce((sum, item) => sum + (item.credits_purchased || 0), 0) || 0);

    const creditsConsumed = usageData.data?.reduce((sum, item) => sum + item.credits_spent, 0) || 0;
    const activeSubCount = activeSubscriptions.data?.length || 0;

    // 2. Daily Usage Chart Data
    const dailyUsageQuery = await supabaseAdmin
      .from('billing_usage_log')
      .select('created_at, credits_spent')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const dailyUsage = {};
    dailyUsageQuery.data?.forEach(item => {
      const date = item.created_at.split('T')[0]; // Get YYYY-MM-DD
      if (!dailyUsage[date]) {
        dailyUsage[date] = 0;
      }
      dailyUsage[date] += item.credits_spent;
    });

    const dailyUsageChart = Object.entries(dailyUsage).map(([date, credits]) => ({
      date,
      credits
    }));

    // 3. Credit Sources Breakdown
    const [ledgerSources, transactionSources] = await Promise.all([
      supabaseAdmin
        .from('billing_credit_ledger')
        .select('source, credits_delta')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .gt('credits_delta', 0),
        
      supabaseAdmin
        .from('billing_transactions')
        .select('type, credits_purchased')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('credits_purchased', 'is', null)
    ]);

    // Group by source/type
    const sourcesBreakdown = {};
    
    ledgerSources.data?.forEach(item => {
      const source = item.source || 'unknown';
      if (!sourcesBreakdown[source]) {
        sourcesBreakdown[source] = 0;
      }
      sourcesBreakdown[source] += item.credits_delta;
    });

    transactionSources.data?.forEach(item => {
      const type = item.type || 'unknown';
      if (!sourcesBreakdown[type]) {
        sourcesBreakdown[type] = 0;
      }
      sourcesBreakdown[type] += item.credits_purchased || 0;
    });

    const sourcesChart = Object.entries(sourcesBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));

    // 4. Recent Activity (last 10 items)
    const recentActivity = await supabaseAdmin
      .from('billing_usage_log')
      .select('user_id, action_type, credits_spent, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const response = {
      summary: {
        creditsGranted,
        creditsConsumed, 
        activeSubscriptions: activeSubCount,
        period: `Last ${days} days`
      },
      charts: {
        dailyUsage: dailyUsageChart,
        creditSources: sourcesChart
      },
      recentActivity: recentActivity.data || []
    };

    console.log('✅ [STATS] Stats generated successfully');
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [STATS] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});