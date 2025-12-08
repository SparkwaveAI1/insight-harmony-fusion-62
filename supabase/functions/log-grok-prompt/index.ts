import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      source = "unknown",
      persona_id,
      persona_name,
      user_message,
      system_instructions,
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

    const metadata = {
      source,
      persona_id,
      persona_name,
      user_message: user_message.substring(0, 200), // Truncate for logging
      system_instructions: system_instructions ? system_instructions.substring(0, 100) + '...' : null,
      conversation_id,
      conversation_history_count: Array.isArray(conversation_history) ? conversation_history.length : 0,
      ...extra,
    };

    // Log to console instead of database to avoid spam
    console.log('[GROK-PROMPT]', JSON.stringify(metadata));

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("log-grok-prompt error", err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
