import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role for secure operations
);

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

async function verifyStripeSignature(req: Request): Promise<Stripe.Event> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !WEBHOOK_SECRET) {
    throw new Error("Missing Stripe signature or webhook secret");
  }

  try {
    return await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🎉 Processing checkout.session.completed:", session.id);
  
  // Only handle payment mode (credit packs) for Task 3C
  if (session.mode !== "payment") {
    console.log(`ℹ️ Ignoring ${session.mode} session - only handling credit packs in Task 3C`);
    return;
  }

  const userId = session.client_reference_id || session.metadata?.user_id;
  const credits = Number(session.metadata?.credits || 0);
  
  if (!userId) {
    throw new Error("No user_id found in session");
  }
  
  if (credits <= 0) {
    throw new Error("Invalid credits amount");
  }

  console.log(`💳 Processing credit pack purchase: ${credits} credits for user ${userId}`);
  
  try {
    // Record transaction (with idempotency protection via unique constraint)
    await supabase.from("billing_transactions").insert({
      user_id: userId,
      amount_usd: (session.amount_total || 0) / 100,
      credits_purchased: credits,
      type: "credit_pack",
      provider: "stripe",
      provider_ref: session.id,
    });

    // Grant credits
    await supabase.from("billing_credit_ledger").insert({
      user_id: userId,
      credits_delta: credits,
      source: "credit_pack",
      status: "settled",
      metadata: { stripe_session: session.id },
    });

    console.log(`✅ Granted ${credits} credits to user ${userId}`);
  } catch (error: any) {
    if (error.message?.includes('duplicate') || error.code === '23505') {
      console.log(`ℹ️ Duplicate webhook for session ${session.id} - already processed`);
      return; // Idempotency - already processed
    }
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("💸 Processing invoice.paid:", invoice.id);
  
  const customerId = invoice.customer as string;
  
  // Find user by customer ID
  const { data: profile, error: profileError } = await supabase
    .from("billing_profiles")
    .select("user_id, plan_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (profileError || !profile) {
    console.error("❌ Failed to find user for customer:", customerId);
    return;
  }

  if (!profile.plan_id) {
    console.log("ℹ️ No plan_id for user, skipping credit grant");
    return;
  }

  // Get plan details
  const { data: plan, error: planError } = await supabase
    .from("billing_plans")
    .select("included_credits")
    .eq("plan_id", profile.plan_id)
    .maybeSingle();

  if (planError || !plan?.included_credits) {
    console.error("❌ Failed to get plan credits:", planError);
    return;
  }

  console.log(`💰 Granting ${plan.included_credits} credits to user ${profile.user_id}`);

  // Record transaction
  await supabase.from("billing_transactions").insert({
    user_id: profile.user_id,
    amount_usd: (invoice.amount_paid || 0) / 100,
    credits_purchased: plan.included_credits,
    type: "subscription",
    provider: "stripe",
    provider_ref: invoice.id,
  });

  // Grant credits
  await supabase.from("billing_credit_ledger").insert({
    user_id: profile.user_id,
    credits_delta: plan.included_credits,
    source: "subscription",
    status: "settled",
    metadata: { 
      stripe_invoice: invoice.id, 
      subscription_id: invoice.subscription as string 
    },
  });

  // Update billing state
  await supabase.from("billing_states").upsert({
    user_id: profile.user_id,
    plan_id: profile.plan_id,
    stripe_customer_id: customerId,
    stripe_subscription_id: invoice.subscription as string,
    last_invoice_id: invoice.id,
    dunning_stage: 0, // Reset on successful payment
  });

  console.log(`✅ Granted ${plan.included_credits} credits to user ${profile.user_id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("❌ Processing invoice.payment_failed:", invoice.id);
  
  const customerId = invoice.customer as string;
  
  // Find user by customer ID
  const { data: profile } = await supabase
    .from("billing_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    console.error("❌ Failed to find user for customer:", customerId);
    return;
  }

  // Increment dunning stage
  const { data: currentState } = await supabase
    .from("billing_states")
    .select("dunning_stage")
    .eq("user_id", profile.user_id)
    .maybeSingle();

  const newDunningStage = Math.min((currentState?.dunning_stage || 0) + 1, 2);

  await supabase.from("billing_states").upsert({
    user_id: profile.user_id,
    stripe_customer_id: customerId,
    stripe_subscription_id: invoice.subscription as string,
    last_invoice_id: invoice.id,
    dunning_stage: newDunningStage,
  });

  console.log(`⚠️ Updated dunning stage to ${newDunningStage} for user ${profile.user_id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("🗑️ Processing customer.subscription.deleted:", subscription.id);
  
  const customerId = subscription.customer as string;
  
  // Find user by customer ID
  const { data: profile } = await supabase
    .from("billing_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    console.error("❌ Failed to find user for customer:", customerId);
    return;
  }

  // Find free plan
  const { data: freePlan } = await supabase
    .from("billing_plans")
    .select("plan_id")
    .eq("name", "Free")
    .eq("is_active", true)
    .maybeSingle();

  // Downgrade to free plan
  await supabase.from("billing_profiles").update({
    plan_id: freePlan?.plan_id || null,
  }).eq("user_id", profile.user_id);

  // Update billing state
  await supabase.from("billing_states").upsert({
    user_id: profile.user_id,
    plan_id: freePlan?.plan_id || null,
    stripe_customer_id: customerId,
    stripe_subscription_id: null,
    dunning_stage: 0,
  });

  console.log(`✅ Downgraded user ${profile.user_id} to free plan`);
}

/**
 * Log webhook event for audit trail
 * Note: No rate limiting on webhooks - Stripe controls send rate
 * and we must process all payment events reliably
 */
function logWebhookEvent(event: Stripe.Event, status: 'received' | 'processed' | 'error', details?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event_id: event.id,
    event_type: event.type,
    status,
    details,
    api_version: event.api_version,
    livemode: event.livemode,
  };
  
  console.log(`📊 [billing-stripe-webhook] ${JSON.stringify(logEntry)}`);
}

serve(async (req) => {
  if (req.method !== 'POST') {
    console.log('📊 [billing-stripe-webhook] Rejected non-POST request');
    return new Response("Method not allowed", { status: 405 });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();

  try {
    console.log(`🔔 [billing-stripe-webhook] Request ${requestId} received at ${new Date().toISOString()}`);
    
    // Verify webhook signature
    const event = await verifyStripeSignature(req);
    console.log(`🔒 [billing-stripe-webhook] Request ${requestId} signature verified, event: ${event.id}, type: ${event.type}`);
    logWebhookEvent(event, 'received');

    // Handle only checkout.session.completed for credit packs (Task 3C scope)
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`ℹ️ [billing-stripe-webhook] Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    logWebhookEvent(event, 'processed', `Completed in ${duration}ms`);
    console.log(`✅ [billing-stripe-webhook] Request ${requestId} completed in ${duration}ms`);

    return new Response(
      JSON.stringify({ received: true, request_id: requestId }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [billing-stripe-webhook] Request ${requestId} error after ${duration}ms:`, err.message);
    console.error(`❌ [billing-stripe-webhook] Stack:`, err.stack);
    
    return new Response(
      JSON.stringify({ error: err.message, request_id: requestId }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});