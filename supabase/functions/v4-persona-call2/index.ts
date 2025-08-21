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
    const { persona_id } = await req.json()
    
    console.log('Starting V4 Call 2 - Summary generation for persona:', persona_id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the full_profile from Call 1
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('id', persona_id)
      .single()

    if (fetchError) {
      console.error('Error fetching persona:', fetchError)
      throw fetchError
    }

    console.log('Retrieved persona for summary generation')

    // Call OpenAI to generate summaries
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
            content: `Create conversation summaries based on the detailed traits provided. 

CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not wrap the response in \`\`\`json or any other formatting.

Return this exact JSON structure:
{
  "conversation_summary": {
    "demographics": {
      "name": "exact name from full_profile",
      "age": exact_age_from_full_profile,
      "occupation": "exact occupation from full_profile",
      "location": "city, region format",
      "background_description": "Rich 2-3 sentence narrative synthesizing their background, values, and daily life"
    },
    "motivation_summary": "Concise description of their top 3-4 motivators and what drives them",
    "communication_style": {
      "directness": "same as full_profile",
      "formality": "same as full_profile",
      "signature_phrases": "same array as full_profile"
    }
  }
}`
          },
          {
            role: 'user',
            content: `Generate summaries for this persona:\n\n${JSON.stringify(persona.full_profile, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    })

    const openaiData = await openaiResponse.json()
    console.log('Summary generation complete')

    // Get the raw content from OpenAI
    const rawContent = openaiData.choices[0].message.content
    console.log('Raw OpenAI summary content:', rawContent)

    // Extract JSON from potential markdown formatting
    const cleanedContent = extractJSONFromMarkdown(rawContent)
    console.log('Cleaned summary content for parsing:', cleanedContent)

    let summaryData
    try {
      summaryData = JSON.parse(cleanedContent)
      console.log('Successfully parsed summary JSON')
    } catch (parseError) {
      console.error('Summary JSON parsing failed:', parseError)
      console.error('Summary content that failed to parse:', cleanedContent)
      throw new Error(`Failed to parse OpenAI summary response as JSON: ${parseError.message}`)
    }

    // Update persona with conversation summary
    const { data: updatedPersona, error: updateError } = await supabase
      .from('v4_personas')
      .update({
        conversation_summary: summaryData.conversation_summary,
        creation_stage: 'completed',
        creation_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', persona_id)
      .select()

    if (updateError) {
      console.error('Error updating persona:', updateError)
      throw updateError
    }

    console.log('Persona updated successfully with summaries')

    return new Response(
      JSON.stringify({ 
        success: true,
        persona_id: updatedPersona[0].id,
        persona_name: updatedPersona[0].name,
        stage: 'completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-persona-call2:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})