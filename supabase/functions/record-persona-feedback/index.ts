import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { 
      persona_id,
      conversation_id,
      user_message,
      response,
      rating,
      reply_received,
      model_used,
      provider_used,
    } = await req.json()

    if (!persona_id || !response) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: persona_id, response' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate rating if provided
    if (rating !== undefined && ![-1, 0, 1].includes(rating)) {
      return new Response(
        JSON.stringify({ error: 'Invalid rating. Must be -1, 0, or 1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('persona_response_quality')
      .insert({
        persona_id,
        conversation_id,
        user_message,
        response,
        explicit_rating: rating,
        reply_received: reply_received || false,
        response_length: response.length,
        model_used,
        provider_used,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to record feedback:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to record feedback', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback_id: data.id,
        message: 'Feedback recorded successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
