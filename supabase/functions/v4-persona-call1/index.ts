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
    const { user_prompt, user_id } = await req.json()
    
    console.log('Starting V4 Call 1 - Detailed traits generation')
    console.log('User prompt:', user_prompt)

    // Call OpenAI to generate detailed traits
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Generate a V4 persona with detailed traits. Return valid JSON with this structure:
            {
              "full_profile": {
                "identity": {
                  "name": "First Last",
                  "age": 35,
                  "gender": "Male/Female",
                  "occupation": "Job Title",
                  "location": {"city": "City", "region": "State", "country": "Country"},
                  "background_summary": "Rich narrative about their life, experiences, values, and personality"
                },
                "motivation_profile": {
                  "self_interest": 0.7,
                  "family": 0.8,
                  "status": 0.5,
                  "mastery": 0.6,
                  "care": 0.4,
                  "security": 0.7,
                  "belonging": 0.3,
                  "novelty": 0.2,
                  "meaning": 0.5
                },
                "communication_style": {
                  "directness": "high/medium/low",
                  "formality": "casual/neutral/formal", 
                  "signature_phrases": ["phrase1", "phrase2", "phrase3"]
                }
              }
            }`
          },
          {
            role: 'user',
            content: user_prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    })

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received')

    const generatedPersona = JSON.parse(openaiData.choices[0].message.content)

    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const persona_id = `v4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabase
      .from('v4_personas')
      .insert([
        {
          persona_id,
          name: generatedPersona.full_profile.identity.name,
          user_id: user_id,
          full_profile: generatedPersona.full_profile,
          conversation_summary: {}, // Empty for now
          creation_stage: 'detailed_traits',
          creation_completed: false
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Persona stored successfully:', data[0].id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        persona_id: data[0].id,
        persona_name: data[0].name,
        stage: 'detailed_traits_complete'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-persona-call1:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})