import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role for secure operations
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting subscription checkout creation");
    const { userId, planId, successUrl, cancelUrl } = await req.json();
    
    console.log("📝 Request params:", { userId, planId });

    // Validate required params
    if (!userId || !planId) {
      throw new Error("Missing required params: userId, planId");
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("billing_plans")
      .select("name, price_usd, included_credits")
      .eq("plan_id", planId)
      .eq("is_active", true)
      .maybeSingle();

    if (planError) {
      console.error("❌ Plan lookup failed:", planError);
      throw new Error("Failed to lookup plan");
    }

    if (!plan) {
      throw new Error("Plan not found or not active");
    }

    console.log("📋 Plan details:", plan);

    // Get or create Stripe customer
    console.log("👤 Getting/creating Stripe customer...");
    
    // First check if user already has a Stripe customer
    const { data: existingProfile } = await supabase
      .from("billing_profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = existingProfile?.stripe_customer_id;

    if (!customerId) {
      // Get user email for customer creation
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user?.email) {
        throw new Error("Failed to get user email for customer creation");
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;

      // Update billing profile with customer ID
      await supabase
        .from("billing_profiles")
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          plan_id: planId,
        });

      console.log("✅ Created new Stripe customer:", customerId);
    } else {
      console.log("✅ Using existing Stripe customer:", customerId);
    }

    // Create checkout session
    console.log("💳 Creating checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Plan`,
              description: `Includes ${plan.included_credits} credits per month`,
            },
            unit_amount: Math.round(plan.price_usd * 100), // Convert to cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get("origin")}/billing/success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/billing/cancel`,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        plan_id: planId,
        included_credits: plan.included_credits.toString(),
      },
    });

    console.log("✅ Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        sessionId: session.id,
        url: session.url,
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (err: any) {
    console.error("❌ Function error:", err);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: err.message || "Unknown error",
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