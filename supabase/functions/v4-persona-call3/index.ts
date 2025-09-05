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
    const { persona_id } = await req.json()
    
    console.log('Starting V4 Call 3 - Profile image generation')
    console.log('Persona ID:', persona_id)
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the V4 persona data
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', persona_id)
      .single()

    if (fetchError) {
      console.error('Error fetching persona:', fetchError)
      throw fetchError
    }

    if (!persona) {
      throw new Error('Persona not found')
    }

    console.log('Fetched persona for image generation:', persona.name)

    // Check if the persona has a physical description for image generation
    const physicalDescription = persona.conversation_summary?.physical_description
    if (!physicalDescription) {
      console.log('No physical description available, skipping image generation')
      return new Response(
        JSON.stringify({ 
          success: true, 
          persona_id: persona_id,
          stage: 'creation_complete',
          message: 'Persona created successfully (no image generated - missing physical description)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Call the existing image generation function
    const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-persona-image', {
      body: { 
        personaData: {
          persona_id: persona.persona_id,
          name: persona.name,
          conversation_summary: persona.conversation_summary,
          full_profile: persona.full_profile
        }
      }
    })

    if (imageError) {
      console.error('Image generation failed:', imageError)
      // Don't throw - image generation failure is non-fatal
      return new Response(
        JSON.stringify({ 
          success: true, 
          persona_id: persona_id,
          stage: 'creation_complete',
          message: 'Persona created successfully (image generation failed)',
          image_error: imageError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('Image generation completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        persona_id: persona_id,
        persona_name: persona.name,
        stage: 'creation_complete',
        image_url: imageData?.image_url,
        message: 'Persona created successfully with profile image!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-persona-call3:', error)
    return new Response(
      JSON.stringify({ 
        success: true, // Still return success since persona creation is complete
        persona_id: req.body?.persona_id,
        stage: 'creation_complete',
        error: error.message,
        message: 'Persona created successfully (image generation failed)'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})