import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log(`[minimal] Starting minimal test...`)

    // Step 1: Simple count query
    console.log(`[minimal] Testing count query...`)
    const { count, error: countError } = await supabase
      .from('persona_creation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (countError) {
      console.error(`[minimal] Count error:`, countError)
      throw new Error(`Count failed: ${countError.message}`)
    }

    console.log(`[minimal] Count result: ${count}`)

    // Step 2: Test RPC call
    console.log(`[minimal] Testing RPC call...`)
    const { data: item, error: popError } = await supabase.rpc('pop_next_persona_queue')

    if (popError) {
      console.warn(`[minimal] RPC warning:`, popError.message)
    }

    console.log(`[minimal] RPC result: ${item ? 'item found' : 'no items'}`)

    const result = {
      success: true,
      message: 'Minimal test completed',
      pending_count: count || 0,
      rpc_result: item ? 'item_found' : 'no_items'
    }

    console.log(`[minimal] Test completed:`, result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[minimal] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})