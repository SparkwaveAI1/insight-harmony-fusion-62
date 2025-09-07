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
    console.log('🔔 [ALERTS] Managing alerts request received');

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
      console.error('❌ [ALERTS] No admin emails configured');
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

    const method = req.method;
    
    if (method === 'GET') {
      // Get alerts with optional filters
      const url = new URL(req.url);
      const status = url.searchParams.get('status') || 'active';
      const severity = url.searchParams.get('severity');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      let query = supabaseAdmin
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data: alerts, error } = await query;

      if (error) {
        console.error('❌ [ALERTS] Error fetching alerts:', error);
        throw error;
      }

      console.log(`✅ [ALERTS] Retrieved ${alerts.length} alerts`);
      return new Response(JSON.stringify({ alerts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'PATCH') {
      // Dismiss/resolve alert
      const { alertId, action } = await req.json();

      if (!alertId || !action) {
        return new Response('Missing alertId or action', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      const updates: any = {
        updated_at: new Date().toISOString()
      };

      if (action === 'dismiss') {
        updates.status = 'dismissed';
        updates.dismissed_at = new Date().toISOString();
        updates.dismissed_by = user.id;
      } else if (action === 'resolve') {
        updates.status = 'resolved';
        updates.dismissed_at = new Date().toISOString();
        updates.dismissed_by = user.id;
      } else {
        return new Response('Invalid action. Use "dismiss" or "resolve"', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      const { data: updatedAlert, error } = await supabaseAdmin
        .from('admin_alerts')
        .update(updates)
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        console.error('❌ [ALERTS] Error updating alert:', error);
        throw error;
      }

      console.log(`✅ [ALERTS] Alert ${alertId} ${action}ed by admin ${user.email}`);
      return new Response(JSON.stringify({ alert: updatedAlert }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      // Create manual alert
      const { type, severity, message, userId, metadata } = await req.json();

      if (!type || !message) {
        return new Response('Missing required fields: type, message', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      let userEmail = null;
      if (userId) {
        const { data: userProfile } = await supabaseAdmin.auth.admin.getUserById(userId);
        userEmail = userProfile?.user?.email;
      }

      const { data: newAlert, error } = await supabaseAdmin
        .from('admin_alerts')
        .insert({
          type,
          severity: severity || 'medium',
          message,
          user_id: userId || null,
          user_email: userEmail,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [ALERTS] Error creating alert:', error);
        throw error;
      }

      console.log(`✅ [ALERTS] Manual alert created by admin ${user.email}`);
      return new Response(JSON.stringify({ alert: newAlert }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
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