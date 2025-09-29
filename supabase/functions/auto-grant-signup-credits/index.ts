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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();
    console.log('Processing signup credit grant for user:', userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if user already received signup credits (idempotency)
    const { data: existingCredit } = await supabase
      .from('billing_credit_ledger')
      .select('ledger_id')
      .eq('user_id', userId)
      .eq('source', 'signup_bonus')
      .maybeSingle();

    if (existingCredit) {
      console.log('User already received signup credits:', userId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Signup credits already granted',
          ledger_id: existingCredit.ledger_id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Grant 200 free credits for signup
    const { data: creditEntry, error: creditError } = await supabase
      .from('billing_credit_ledger')
      .insert({
        user_id: userId,
        credits_delta: 200,
        source: 'signup_bonus',
        status: 'settled',
        action_type: 'signup_grant',
        metadata: {
          granted_at: new Date().toISOString(),
          amount: 200,
          reason: 'New user signup bonus'
        }
      })
      .select()
      .single();

    if (creditError) {
      throw new Error(`Failed to grant credits: ${creditError.message}`);
    }

    console.log('Successfully granted 200 signup credits to user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully granted 200 signup credits',
        ledger_id: creditEntry.ledger_id,
        credits_granted: 200
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error granting signup credits:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});