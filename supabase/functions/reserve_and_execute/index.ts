import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role for billing RPCs
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lookup credits cost from price book
async function getCreditsRequired(actionType: string): Promise<number> {
  const { data: price, error } = await supabase
    .from("billing_price_book")
    .select("credits_cost")
    .eq("action_type", actionType)
    .eq("is_active", true)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching price:", error);
    throw new Error(`Failed to lookup pricing for action: ${actionType}`);
  }
  
  if (!price?.credits_cost) {
    throw new Error(`Unpriced action type: ${actionType}`);
  }
  
  return price.credits_cost;
}

// Stub action (replace later with real logic)
async function performAction(actionType: string, payload: any) {
  console.log(`🔥 Performing action: ${actionType}`, payload);
  
  // Simulate ~200ms delay
  await new Promise((r) => setTimeout(r, 200));

  if (payload?.forceFail) {
    throw new Error("Simulated action failure");
  }

  return { 
    actionType, 
    echo: payload,
    timestamp: new Date().toISOString(),
    processingTime: "200ms"
  };
}

// Perform action with timeout protection
async function performActionWithTimeout(actionType: string, payload: any, timeoutMs: number = 30000) {
  return Promise.race([
    performAction(actionType, payload),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Action timeout")), timeoutMs)
    )
  ]);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting reserve_and_execute function");
    const { userId, actionType, actionPayload, idempotencyKey } = await req.json();
    
    console.log("📝 Request params:", { userId, actionType, idempotencyKey });

    // Validate required params
    if (!userId || !actionType) {
      throw new Error("Missing required params: userId, actionType");
    }

    // Get dynamic pricing
    console.log("💲 Looking up credits required...");
    const requiredCredits = await getCreditsRequired(actionType);
    console.log(`📊 Credits required for ${actionType}: ${requiredCredits}`);

    // 1. Reserve credits
    console.log("💰 Reserving credits...");
    const { data: reservation, error: reserveError } = await supabase.rpc(
      "billing_reserve_credits",
      {
        p_user_id: userId,
        p_action_type: actionType,
        p_required_credits: requiredCredits,
        p_idempotency_key: idempotencyKey,
      }
    );

    if (reserveError) {
      console.error("❌ Reservation failed:", reserveError);
      throw reserveError;
    }

    console.log("✅ Credits reserved:", reservation);

    let usageId: string | null = null;
    try {
      // 2. Perform actual work with timeout protection
      console.log("🔧 Executing action...");
      const result = await performActionWithTimeout(actionType, actionPayload);
      console.log("✅ Action completed:", result);

      // 3. Finalize the reservation (mark as settled and log usage)
      console.log("🏁 Finalizing credits...");
      const { data: finalizeData, error: finalizeError } = await supabase.rpc(
        "billing_finalize_credits",
        {
          p_ledger_id: reservation.ledger_id,
          p_usage_metadata: {
            ...actionPayload,
            result_summary: `${actionType} completed successfully`,
            processing_time_ms: 200
          },
        }
      );
      
      if (finalizeError) {
        console.error("❌ Finalization failed:", finalizeError);
        throw finalizeError;
      }

      usageId = finalizeData;
      console.log("✅ Credits finalized, usage_id:", usageId);

      return new Response(
        JSON.stringify({ 
          ok: true, 
          result, 
          usageId,
          ledgerId: reservation.ledger_id,
          creditsUsed: requiredCredits
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );

    } catch (actionError) {
      // 4. Reverse the reservation on failure
      console.log("💥 Action failed, reversing credits...");
      const { error: reverseError } = await supabase.rpc("billing_reverse_credits", {
        p_ledger_id: reservation.ledger_id,
      });
      
      if (reverseError) {
        console.error("❌ Credit reversal failed:", reverseError);
        // Log but don't throw - we still want to report the original action error
      } else {
        console.log("✅ Credits reversed successfully");
      }
      
      throw actionError;
    }

  } catch (err: any) {
    console.error("❌ Function error:", err);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: err.message || "Unknown error",
        details: err.details || null
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});