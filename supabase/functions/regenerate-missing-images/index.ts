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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse optional parameters
    const body = await req.json().catch(() => ({}))
    const limit = body.limit || 5 // Default to 5 at a time to avoid timeouts
    const specificPersonaId = body.persona_id // Optional: regenerate specific persona

    console.log(`[regenerate-missing-images] Starting with limit=${limit}, specificPersonaId=${specificPersonaId || 'none'}`)

    // Find personas with missing images
    let query = supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile, conversation_summary')
      .is('profile_image_url', null)
      .limit(limit)

    if (specificPersonaId) {
      query = supabase
        .from('v4_personas')
        .select('persona_id, name, full_profile, conversation_summary')
        .eq('persona_id', specificPersonaId)
        .limit(1)
    }

    const { data: personas, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`)
    }

    if (!personas || personas.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No personas with missing images found', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[regenerate-missing-images] Found ${personas.length} personas to process`)

    const results: { persona_id: string; name: string; success: boolean; error?: string }[] = []

    for (const persona of personas) {
      try {
        console.log(`[regenerate-missing-images] Processing ${persona.name} (${persona.persona_id})`)

        // Call generate-persona-image function
        const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-persona-image', {
          body: { personaData: persona }
        })

        if (imageError) {
          console.error(`[regenerate-missing-images] Image generation failed for ${persona.persona_id}:`, imageError)
          results.push({
            persona_id: persona.persona_id,
            name: persona.name,
            success: false,
            error: imageError.message || 'Image generation failed'
          })
        } else {
          console.log(`[regenerate-missing-images] Successfully generated image for ${persona.name}:`, imageResult?.image_url)
          results.push({
            persona_id: persona.persona_id,
            name: persona.name,
            success: true
          })
        }
      } catch (err: any) {
        console.error(`[regenerate-missing-images] Error processing ${persona.persona_id}:`, err)
        results.push({
          persona_id: persona.persona_id,
          name: persona.name,
          success: false,
          error: err.message || 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} personas: ${successCount} succeeded, ${failCount} failed`,
        processed: results.length,
        succeeded: successCount,
        failed: failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[regenerate-missing-images] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
