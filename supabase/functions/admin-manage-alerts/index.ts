import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

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
      const startTime = Date.now();
      const url = new URL(req.url);
      const severity = url.searchParams.get('severity');
      const status = url.searchParams.get('status') || 'active';
      const type = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const cursor = url.searchParams.get('cursor');

      let query = supabaseAdmin
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (severity && severity !== 'all') {
        query = query.eq('severity', severity);
      }
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      
      // Cursor pagination
      if (cursor) {
        const [timestamp, id] = cursor.split('|');
        query = query.or(`created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`);
      }

      const { data: alerts, error } = await query;

      if (error) {
        console.error('❌ [ALERTS] Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch alerts' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate next cursor if we have results
      const nextCursor = alerts && alerts.length === limit 
        ? `${alerts[alerts.length - 1].created_at}|${alerts[alerts.length - 1].id}`
        : null;

      const duration = Date.now() - startTime;
      console.log(`✅ [ALERTS] Retrieved ${alerts?.length || 0} alerts in ${duration}ms`);
      
      return new Response(
        JSON.stringify({ 
          data: alerts || [], 
          next_cursor: nextCursor,
          has_more: alerts ? alerts.length === limit : false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        // Ignore unique constraint violations (23505) as they're expected for idempotency
        if (error.code !== '23505') {
          throw error;
        }
        console.log('ℹ️ [ALERTS] Duplicate alert ignored (idempotency)');
        return new Response(JSON.stringify({ alert: null, message: 'Duplicate alert ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
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