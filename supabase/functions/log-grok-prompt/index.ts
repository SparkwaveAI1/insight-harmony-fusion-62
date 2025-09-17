import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE envs");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      source = "unknown",
      persona_id,
      persona_name,
      user_message,
      conversation_id,
      conversation_history = [],
      extra = {},
    } = body || {};

    // Basic validation
    if (!user_message) {
      return new Response(JSON.stringify({ error: "user_message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const metadata = {
      source,
      persona_id,
      persona_name,
      user_message,
      conversation_id,
      conversation_history: Array.isArray(conversation_history)
        ? conversation_history.slice(-5)
        : [],
      ...extra,
    };

    const insertPayload = {
      type: "grok_prompt",
      message: "Grok prompt sent",
      severity: "low",
      status: "active",
      metadata,
    } as const;

    const { error } = await supabaseAdmin
      .from("admin_alerts")
      .insert(insertPayload);

    if (error) {
      console.error("Failed to insert grok prompt log", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("log-grok-prompt error", err);
    return new Response(JSON.stringify({ success: false, error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
