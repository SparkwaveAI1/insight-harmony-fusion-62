import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';
import { createErrorResponse, logError } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 10 requests per minute for billing operations
const RATE_LIMIT_CONFIG = { maxRequests: 10, windowSeconds: 60 };

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const functionName = 'billing-checkout-subscription';
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting subscription checkout creation");
    const { userId, planId } = await req.json();
    
    console.log("📝 Request params:", { userId, planId });

    // Validate required params
    if (!userId || !planId) {
      throw new Error("Missing required params: userId, planId");
    }

    // Check rate limit using the provided userId
    const rateLimitResult = await checkRateLimit(supabase, userId, functionName, RATE_LIMIT_CONFIG);
    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for user ${userId} on ${functionName}`);
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("billing_plans")
      .select("*")
      .eq("plan_id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      console.error("Plan fetch error:", planError);
      throw new Error("Invalid or inactive plan");
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
              name: plan.name,
              description: `${plan.included_credits} credits included monthly`,
            },
            unit_amount: Math.round(plan.price_usd * 100), // Convert to cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/billing/success`,
      cancel_url: `${req.headers.get("origin")}/billing/cancel`,
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
        url: session.url,
        sessionId: session.id,
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