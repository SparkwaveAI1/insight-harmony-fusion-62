import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    
    const { error } = await supabase.from('acp_delivery_logs').insert({
      job_id: payload.job_id,
      attempt_type: payload.attempt_type,
      payload_type: payload.payload_type,
      payload_size_bytes: payload.payload_size_bytes,
      payload_keys: payload.payload_keys,
      study_results_keys: payload.study_results_keys,
      summary_report_keys: payload.summary_report_keys,
      has_qualitative_report: payload.has_qualitative_report,
      full_payload_preview: payload.full_payload_preview,
      deliver_error: payload.deliver_error,
    })

    if (error) {
      console.error('Error logging delivery:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ logged: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in log-acp-delivery:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
