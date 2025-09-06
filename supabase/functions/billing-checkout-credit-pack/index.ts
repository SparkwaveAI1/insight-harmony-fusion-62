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

// Credit pack configurations
const CREDIT_PACKS = {
  CREDITS_100: { name: "100 Credits", credits: 100, priceUSD: 10 },
  CREDITS_500: { name: "500 Credits", credits: 500, priceUSD: 45 },
  CREDITS_1000: { name: "1000 Credits", credits: 1000, priceUSD: 80 },
} as const;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting credit pack checkout creation");
    const { userId, packType } = await req.json();
    
    console.log("📝 Request params:", { userId, packType });

    // Validate required params
    if (!userId || !packType) {
      throw new Error("Missing required params: userId, packType");
    }

    // Validate pack type
    if (!(packType in CREDIT_PACKS)) {
      throw new Error("Invalid pack type");
    }

    const pack = CREDIT_PACKS[packType as keyof typeof CREDIT_PACKS];
    console.log("📦 Credit pack details:", pack);

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
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pack.name,
              description: `${pack.credits} credits for your account`,
            },
            unit_amount: Math.round(pack.priceUSD * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/billing/success`,
      cancel_url: `${req.headers.get("origin")}/billing/cancel`,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        credits: pack.credits.toString(),
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