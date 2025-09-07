import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdjustCreditsRequest {
  userId: string;
  delta: number;
  reason: string;
  ticket?: string;
  idempotencyKey?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 [ADMIN] Credit adjustment request received');

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ [ADMIN] No authorization header');
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Verify the JWT and get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ [ADMIN] Invalid token:', authError);
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Admin emails check (same as admin-search-users)
    const ADMIN_EMAILS = [
      "cumbucotrader@gmail.com", 
      "scott@sparkwave-ai.com",
    ];

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
      console.error(`❌ [ADMIN] User ${user.email} is not an admin`);
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    console.log('✅ [ADMIN] Admin verified:', user.id);

    // Parse request body
    const body: AdjustCreditsRequest = await req.json();
    console.log('📝 [ADMIN] Request body:', { ...body, reason: body.reason?.substring(0, 50) });

    // Input validation
    if (!body.userId || !body.delta || !body.reason) {
      return new Response('Missing required fields: userId, delta, reason', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate delta range
    if (Math.abs(body.delta) > 10000) {
      return new Response('Delta too large: maximum 10,000 credits', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.userId)) {
      return new Response('Invalid userId format', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate reason length
    if (body.reason.trim().length < 5 || body.reason.trim().length > 500) {
      return new Response('Reason must be between 5 and 500 characters', {
        status: 400,
        headers: corsHeaders
      });
    }

    console.log('✅ [ADMIN] Input validation passed');

    // Check for idempotency
    if (body.idempotencyKey) {
      const { data: existing } = await supabaseAdmin
        .from('billing_credit_ledger')
        .select('ledger_id, credits_delta')
        .eq('idempotency_key', body.idempotencyKey)
        .eq('user_id', body.userId)
        .single();

      if (existing) {
        console.log('🔄 [ADMIN] Idempotent request, returning existing adjustment');
        return new Response(JSON.stringify({
          success: true,
          ledgerId: existing.ledger_id,
          creditsDelta: existing.credits_delta,
          message: 'Adjustment already processed (idempotent)'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get current balance for logging
    const { data: currentBalance } = await supabaseAdmin
      .from('billing_credit_available')
      .select('available')
      .eq('user_id', body.userId)
      .single();

    console.log('💰 [ADMIN] Current balance for user:', currentBalance?.available || 0);

    // Prepare metadata
    const metadata = {
      reason: body.reason.trim(),
      admin_id: user.id,
      admin_email: user.email,
      ticket: body.ticket?.trim() || null,
      timestamp: new Date().toISOString()
    };

    // Insert into billing_credit_ledger
    const { data: ledgerEntry, error: ledgerError } = await supabaseAdmin
      .from('billing_credit_ledger')
      .insert({
        user_id: body.userId,
        credits_delta: body.delta,
        source: 'admin_adjustment',
        status: 'settled',
        action_type: 'admin_credit_adjustment',
        metadata,
        idempotency_key: body.idempotencyKey || null
      })
      .select('ledger_id, credits_delta')
      .single();

    if (ledgerError) {
      console.error('❌ [ADMIN] Failed to insert ledger entry:', ledgerError);
      return new Response('Failed to process credit adjustment', {
        status: 500,
        headers: corsHeaders
      });
    }

    console.log('✅ [ADMIN] Ledger entry created:', ledgerEntry.ledger_id);

    // Optional: Insert into billing_transactions for audit trail
    if (body.delta !== 0) {
      const transactionData = {
        user_id: body.userId,
        type: 'adjustment',
        amount_usd: null,
        credits_purchased: Math.max(body.delta, 0),
        provider: 'internal',
        provider_ref: body.idempotencyKey || `admin_adj_${ledgerEntry.ledger_id}`
      };

      const { error: transactionError } = await supabaseAdmin
        .from('billing_transactions')
        .insert(transactionData);

      if (transactionError) {
        console.warn('⚠️ [ADMIN] Failed to create transaction record:', transactionError);
        // Don't fail the whole operation for this
      } else {
        console.log('✅ [ADMIN] Transaction record created');
      }
    }

    // Get updated balance
    const { data: newBalance } = await supabaseAdmin
      .from('billing_credit_available')
      .select('available')
      .eq('user_id', body.userId)
      .single();

    console.log('💰 [ADMIN] New balance for user:', newBalance?.available || 0);

    const response = {
      success: true,
      ledgerId: ledgerEntry.ledger_id,
      creditsDelta: ledgerEntry.credits_delta,
      balanceBefore: currentBalance?.available || 0,
      balanceAfter: newBalance?.available || 0,
      message: `Successfully ${body.delta > 0 ? 'added' : 'removed'} ${Math.abs(body.delta)} credits`
    };

    console.log('🎉 [ADMIN] Credit adjustment completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [ADMIN] Unexpected error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders
    });
  }
});