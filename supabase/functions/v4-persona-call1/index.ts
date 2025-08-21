import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to extract JSON from markdown code blocks
function extractJSONFromMarkdown(text: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  // Return original text if no markdown blocks found
  return text.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_prompt, user_id } = await req.json()
    
    console.log('Starting V4 Call 1 - Detailed traits generation')
    console.log('User prompt:', user_prompt)
    
    // Check if OpenAI API key is available
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found')
      throw new Error('OpenAI API key not configured')
    }

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
            content: `Generate a V4 persona with detailed traits. 

CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not wrap the response in \`\`\`json or any other formatting.

Return this exact JSON structure:
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

    // Get the raw content from OpenAI
    const rawContent = openaiData.choices[0].message.content
    console.log('Raw OpenAI content:', rawContent)

    // Extract JSON from potential markdown formatting
    const cleanedContent = extractJSONFromMarkdown(rawContent)
    console.log('Cleaned content for parsing:', cleanedContent)

    let generatedPersona
    try {
      generatedPersona = JSON.parse(cleanedContent)
      console.log('Successfully parsed persona JSON')
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      console.error('Content that failed to parse:', cleanedContent)
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`)
    }

    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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