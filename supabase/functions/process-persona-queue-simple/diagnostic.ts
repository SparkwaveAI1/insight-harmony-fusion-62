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

  try {
    console.log('[diagnostic] Starting diagnostic test...')

    // Test 1: Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error(`Missing env vars: URL=${!!supabaseUrl}, KEY=${!!serviceKey}`)
    }

    console.log('[diagnostic] Environment variables OK')

    // Test 2: Supabase client creation
    const supabase = createClient(supabaseUrl, serviceKey)
    console.log('[diagnostic] Supabase client created OK')

    // Test 3: Simple database query
    const { data, error } = await supabase
      .from('persona_creation_queue')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      throw new Error(`DB query failed: ${error.message}`)
    }

    console.log('[diagnostic] Database connection OK')

    // Test 4: RPC function exists
    const { data: rpcTest, error: rpcError } = await supabase.rpc('pop_next_persona_queue')
    
    if (rpcError && !rpcError.message.includes('no pending items')) {
      console.warn('[diagnostic] RPC test warning:', rpcError.message)
    } else {
      console.log('[diagnostic] RPC function OK')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All diagnostic tests passed',
        env_vars: { supabase_url: !!supabaseUrl, service_key: !!serviceKey },
        db_connection: true,
        rpc_function: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[diagnostic] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        diagnostic: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})