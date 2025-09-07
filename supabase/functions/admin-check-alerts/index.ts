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
    const ADMIN_EMAILS = [
      "cumbucotrader@gmail.com", 
      "scott@sparkwave-ai.com",
    ];

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
      console.error(`❌ [ALERTS] User ${user.email} is not an admin`);
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    const alertsCreated = [];

    // 1. Check for low credit balances
    console.log('🔍 [ALERTS] Checking credit balances...');
    const { data: lowCreditUsers } = await supabaseAdmin
      .from('billing_credit_available')
      .select('user_id, available')
      .lt('available', 50); // Less than 50 credits

    if (lowCreditUsers) {
      for (const userCredit of lowCreditUsers) {
        // Check if alert already exists for this user
        const { data: existingAlert } = await supabaseAdmin
          .from('admin_alerts')
          .select('id')
          .eq('type', 'credit_low')
          .eq('user_id', userCredit.user_id)
          .eq('status', 'active')
          .single();

        if (!existingAlert) {
          // Get user email
          const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(userCredit.user_id);
          
          const { data: newAlert } = await supabaseAdmin
            .from('admin_alerts')
            .insert({
              type: 'credit_low',
              severity: userCredit.available <= 10 ? 'critical' : 'high',
              message: `User has ${userCredit.available} credits remaining`,
              user_id: userCredit.user_id,
              user_email: userProfile?.user?.email,
              metadata: { 
                current_balance: userCredit.available,
                threshold: userCredit.available <= 10 ? 10 : 50
              }
            })
            .select()
            .single();
          
          if (newAlert) {
            alertsCreated.push(newAlert);
            console.log(`🚨 [ALERTS] Created low credit alert for user ${userCredit.user_id}`);
          }
        }
      }
    }

    // 2. Check for usage spikes (>500 credits in last 24h)
    console.log('🔍 [ALERTS] Checking usage spikes...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: usageSpikes } = await supabaseAdmin
      .from('billing_usage_log')
      .select('user_id, credits_spent')
      .gte('created_at', yesterday.toISOString());

    if (usageSpikes) {
      const userUsage = {};
      usageSpikes.forEach(usage => {
        if (!userUsage[usage.user_id]) {
          userUsage[usage.user_id] = 0;
        }
        userUsage[usage.user_id] += usage.credits_spent;
      });

      for (const [userId, totalUsage] of Object.entries(userUsage)) {
        if (totalUsage > 500) {
          // Check if alert already exists
          const { data: existingAlert } = await supabaseAdmin
            .from('admin_alerts')
            .select('id')
            .eq('type', 'usage_spike')
            .eq('user_id', userId)
            .eq('status', 'active')
            .gte('created_at', yesterday.toISOString())
            .single();

          if (!existingAlert) {
            // Get user email
            const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(userId);
            
            const { data: newAlert } = await supabaseAdmin
              .from('admin_alerts')
              .insert({
                type: 'usage_spike',
                severity: totalUsage > 1000 ? 'critical' : 'high',
                message: `User consumed ${totalUsage} credits in the last 24 hours`,
                user_id: userId,
                user_email: userProfile?.user?.email,
                metadata: { 
                  usage_24h: totalUsage,
                  threshold: 500
                }
              })
              .select()
              .single();
            
            if (newAlert) {
              alertsCreated.push(newAlert);
              console.log(`🚨 [ALERTS] Created usage spike alert for user ${userId}`);
            }
          }
        }
      }
    }

    // 3. Check for expiring subscriptions (within 7 days)
    console.log('🔍 [ALERTS] Checking expiring subscriptions...');
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringSubscriptions } = await supabaseAdmin
      .from('billing_profiles')
      .select('user_id, renewal_date, plan_id')
      .eq('auto_renew', false)
      .lte('renewal_date', sevenDaysFromNow.toISOString())
      .gte('renewal_date', new Date().toISOString());

    if (expiringSubscriptions) {
      for (const subscription of expiringSubscriptions) {
        // Check if alert already exists
        const { data: existingAlert } = await supabaseAdmin
          .from('admin_alerts')
          .select('id')
          .eq('type', 'subscription_expiring')
          .eq('user_id', subscription.user_id)
          .eq('status', 'active')
          .single();

        if (!existingAlert) {
          // Get user email
          const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
          const daysUntilExpiry = Math.ceil((new Date(subscription.renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          const { data: newAlert } = await supabaseAdmin
            .from('admin_alerts')
            .insert({
              type: 'subscription_expiring',
              severity: daysUntilExpiry <= 3 ? 'high' : 'medium',
              message: `Subscription expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
              user_id: subscription.user_id,
              user_email: userProfile?.user?.email,
              metadata: { 
                renewal_date: subscription.renewal_date,
                days_until_expiry: daysUntilExpiry,
                plan_id: subscription.plan_id
              }
            })
            .select()
            .single();
          
          if (newAlert) {
            alertsCreated.push(newAlert);
            console.log(`🚨 [ALERTS] Created subscription expiring alert for user ${subscription.user_id}`);
          }
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