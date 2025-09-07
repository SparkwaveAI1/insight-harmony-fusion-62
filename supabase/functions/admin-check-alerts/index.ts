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
    console.log('🚨 [ALERTS] Checking for alert conditions');

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT (admin only)
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ [ALERTS] Authentication failed:', userError);
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
      console.error('❌ [CHECK-ALERTS] No admin emails configured');
      return new Response('Admin emails not configured', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      console.error(`❌ [ALERTS] User ${user.email} is not an admin`);
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    const alertsCreated = [];

    // 1. Check for low credit balances (< 10 credits = critical)
    console.log('🔍 [ALERTS] Checking credit balances...');
    const { data: lowCreditUsers } = await supabaseAdmin
      .from('billing_credit_available')
      .select('user_id, available')
      .lt('available', 10);

    if (lowCreditUsers) {
      for (const userCredit of lowCreditUsers) {
        try {
          // Get user email
          const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(userCredit.user_id);
          
          const { error } = await supabaseAdmin
            .from('admin_alerts')
            .insert({
              type: 'credit_low',
              severity: 'critical',
              message: `User ${userCredit.user_id} has only ${userCredit.available} credits remaining`,
              user_id: userCredit.user_id,
              user_email: userProfile?.user?.email,
              metadata: { available_credits: userCredit.available }
            });

          // Handle unique violations gracefully (alert already exists)
          if (error && error.code !== '23505') {
            console.error('Error creating credit alert:', error);
          } else if (!error) {
            alertsCreated.push(`credit_low for user ${userCredit.user_id}`);
          }
        } catch (err) {
          console.error('Error processing low credit alert:', err);
        }
      }
    }

    // 2. Check for high usage in last 24h (> 500 credits = high, > 1000 = critical)
    console.log('🔍 [ALERTS] Checking usage spikes...');
    const now = new Date();
    const yesterday = new Date(now.toISOString());
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: usageSpikes } = await supabaseAdmin
      .from('billing_usage_log')
      .select('user_id, credits_spent')
      .gte('created_at', yesterday.toISOString());

    if (usageSpikes) {
      const userUsage = new Map();
      usageSpikes.forEach(usage => {
        const current = userUsage.get(usage.user_id) || 0;
        userUsage.set(usage.user_id, current + usage.credits_spent);
      });

      for (const [userId, totalSpent] of userUsage.entries()) {
        if (totalSpent > 500) {
          const severity = totalSpent > 1000 ? 'critical' : 'high';
          try {
            // Get user email
            const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(userId);
            
            const { error } = await supabaseAdmin
              .from('admin_alerts')
              .insert({
                type: 'usage_spike',
                severity,
                message: `User ${userId} spent ${totalSpent} credits in the last 24 hours`,
                user_id: userId,
                user_email: userProfile?.user?.email,
                metadata: { credits_spent_24h: totalSpent }
              });

            // Handle unique violations gracefully
            if (error && error.code !== '23505') {
              console.error('Error creating usage alert:', error);
            } else if (!error) {
              alertsCreated.push(`usage_spike (${severity}) for user ${userId}`);
            }
          } catch (err) {
            console.error('Error processing usage alert:', err);
          }
        }
      }
    }

    // 3. Check for subscriptions expiring in 3 days
    console.log('🔍 [ALERTS] Checking expiring subscriptions...');
    const now = new Date();
    const threeDaysFromNow = new Date(now.toISOString());
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: expiringSubscriptions } = await supabaseAdmin
      .from('billing_profiles')
      .select('user_id, renewal_date, plan_id')
      .eq('auto_renew', false)
      .lte('renewal_date', threeDaysFromNow.toISOString());

    if (expiringSubscriptions) {
      for (const subscription of expiringSubscriptions) {
        try {
          // Get user email
          const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
          const daysUntilExpiry = Math.ceil((new Date(subscription.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          const { error } = await supabaseAdmin
            .from('admin_alerts')
            .insert({
              type: 'subscription_expiring',
              severity: 'high',
              message: `User ${subscription.user_id} subscription expires on ${new Date(subscription.renewal_date).toDateString()}`,
              user_id: subscription.user_id,
              user_email: userProfile?.user?.email,
              metadata: { 
                renewal_date: subscription.renewal_date,
                plan_id: subscription.plan_id,
                days_until_expiry: daysUntilExpiry
              }
            });

          // Handle unique violations gracefully
          if (error && error.code !== '23505') {
            console.error('Error creating expiring subscription alert:', error);
          } else if (!error) {
            alertsCreated.push(`subscription_expiring for user ${subscription.user_id}`);
          }
        } catch (err) {
          console.error('Error processing expiring subscription alert:', err);
        }
      }
    }

    console.log(`✅ [ALERTS] Alert check completed. Created ${alertsCreated.length} new alerts`);

    return new Response(JSON.stringify({ 
      alertsChecked: true,
      newAlertsCount: alertsCreated.length,
      newAlerts: alertsCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [ALERTS] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});