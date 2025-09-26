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
    let physicalDescription = persona.conversation_summary?.physical_description
    
    // Generate fallback physical description if missing or insufficient
    if (!physicalDescription || physicalDescription.length < 50) {
      console.log('Physical description missing or insufficient, generating fallback from profile data')
      
      try {
        const fullProfile = persona.full_profile
        const demographics = fullProfile?.identity || {}
        const health = fullProfile?.health_profile || {}
        const physical = health.physical_appearance || {}
        
        // Build physical description from structured data
        const age = demographics.age || 'adult'
        const gender = demographics.gender || 'person'
        const ethnicity = demographics.ethnicity || ''
        const height = physical.height || 'average height'
        const build = physical.build || health.fitness_level || 'average build'
        const hairColor = physical.hair_color || 'brown'
        const hairStyle = physical.hair_style || 'standard'
        const eyeColor = physical.eye_color || 'brown'
        const facialHair = physical.facial_hair || (gender.toLowerCase() === 'male' ? 'clean-shaven' : 'none')
        
        physicalDescription = `A ${age}-year-old ${ethnicity ? ethnicity + ' ' : ''}${gender} with ${height} and ${build}. Has ${hairStyle} ${hairColor} hair and ${eyeColor} eyes. ${facialHair !== 'none' ? `Facial hair: ${facialHair}.` : ''} Appears professional and well-groomed, reflecting their occupation as ${demographics.occupation || 'professional'}. Overall appearance suggests someone who is ${health.fitness_level || 'moderately active'} with a ${build} physique.`
        
        console.log('Generated fallback physical description:', physicalDescription.slice(0, 100) + '...')
        
      } catch (error) {
        console.error('Failed to generate fallback physical description:', error)
        return new Response(
          JSON.stringify({ 
            success: true, 
            persona_id: persona_id,
            stage: 'creation_complete',
            message: 'Persona created successfully (no image generated - could not create physical description)'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
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
        persona_id: '',
        stage: 'creation_complete',
        error: error instanceof Error ? error.message : String(error),
        message: 'Persona created successfully (image generation failed)'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})