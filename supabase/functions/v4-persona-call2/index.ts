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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the full_profile from Call 1
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', persona_id)
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
            content: `Analyze the complete detailed persona traits and create accurate conversation summaries for all categories.

TASK: Generate conversation summaries that capture the essence and key patterns from the full_profile.

Return valid JSON with this exact structure:
{
  "conversation_summary": {
     "demographics": {
       "name": "exact name from full_profile",
       "age": exact_age_from_full_profile,
       "occupation": "exact occupation from full_profile",
       "location": "city, region format",
       "background_description": "Rich 3-4 sentence narrative synthesizing identity, cultural background, life situation, key relationships, and what occupies their daily thoughts"
     },
     "physical_description": "Detailed physical description for image generation using EXACT data from physical_profile: height, build, hair, eyes, skin_tone, facial_features, clothing_style, notable_characteristics. If physical_profile exists, use those exact details. Otherwise infer from age, occupation, cultural background, and lifestyle.",
    "motivation_summary": "Concise qualitative description focusing on top 3-4 primary drivers and how they manifest in decisions. Include goal orientation strength and typical want vs should patterns.",
    "goal_priorities": "List current goals with intensity: goal_name (intensity_1-10); goal_name (intensity_1-10); goal_name (intensity_1-10)",
    "want_vs_should_pattern": "Concise description of how they typically resolve conflicts between desires and obligations, including key trigger situations",
    "inhibitor_summary": "Concise description of main psychological barriers that hold them back, including social sensitivity, risk aversion, confidence issues, and mental health factors",
    "truth_flexibility_summary": "Concise description of their relationship with honesty - baseline truthfulness, when/how they bend truth, and how self-interest affects their honesty in different contexts",
    "knowledge_profile": {
      "education_level": "exact from full_profile",
      "expertise_domains": "exact array from full_profile",
      "knowledge_gaps": "exact array from full_profile", 
      "vocabulary_ceiling": "exact from full_profile"
    },
    "voice_summary": "Concise description of their distinctive communication style including directness level, formality, emotional expression, pace, and signature linguistic patterns",
    "communication_style": {
      "directness": "exact from full_profile voice_foundation.directness_level",
      "formality": "exact from full_profile voice_foundation.formality_default",
      "signature_phrases": "exact array from full_profile linguistic_signature.signature_phrases",
      "response_patterns": {
        "advice": "exact from full_profile response_architecture.advice_structure",
        "opinion": "exact from full_profile response_architecture.opinion_structure"
      },
      "forbidden_expressions": "exact array from full_profile authenticity_filters.forbidden_phrases"
    },
    "emotional_triggers_summary": "Concise summary in format: 'Energized by: [positive triggers]. Frustrated by: [negative triggers]. Explosive reactions to: [explosive triggers]'",
    "contradictions_summary": "Concise summary of their main internal tensions and contradictions, including when these contradictions surface and how they typically manifest",
    "sexuality_summary": "Concise summary of their sexuality profile including orientation, expression style, boundaries, and how this influences their communication and social behavior"
  }
}

CRITICAL REQUIREMENTS:
- Summaries must accurately reflect the detailed traits from full_profile, not generic interpretations
- Extract exact values for communication_style and knowledge_profile fields
- Make summaries concise but capture essential behavioral patterns
- Ensure background_description synthesizes multiple trait categories into coherent narrative
- Focus on how traits manifest in conversation and decision-making
- Use EXACT physical details from full_profile.physical_profile if available
- Generate realistic physical description based on age, ethnicity, occupation, lifestyle AND physical_profile
- Include details useful for AI image generation: height, build, hair, eyes, skin tone, clothing style
- Make physical appearance consistent with cultural background and occupation
- PRESERVE weight/body type information from physical_profile (overweight, slim, muscular, etc.)
- Consider how lifestyle (exercise habits, work environment, etc.) affects appearance
- Return ONLY the JSON object, no explanations or markdown`
          },
          {
            role: 'user',
            content: `Generate summaries for this persona:\n\n${JSON.stringify(persona.full_profile, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
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
      .eq('persona_id', persona_id)
      .select()

    if (updateError) {
      console.error('Error updating persona:', updateError)
      throw updateError
    }

    console.log('Persona updated successfully with summaries')

    return new Response(
      JSON.stringify({ 
        success: true,
        persona_id: updatedPersona[0].persona_id,
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