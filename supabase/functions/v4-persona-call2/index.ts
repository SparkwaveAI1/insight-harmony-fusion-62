import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to extract JSON from markdown code blocks
function extractJSONFromMarkdown(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
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

    // Call OpenAI to generate summaries based on new V4 structure
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
            content: `Analyze the complete V4 persona and create accurate conversation summaries for all categories.

TASK: Generate conversation summaries that capture the essence from the new V4 persona structure.

Return valid JSON with this exact structure:
{
  "conversation_summary": {
     "demographics": {
       "name": "exact name from identity.name",
       "age": exact_age_from_identity.age,
       "occupation": "exact occupation from identity.occupation",
       "location": "city, region format from identity.location",
       "background_description": "Rich 3-4 sentence narrative synthesizing identity, cultural background, life situation, relationships, and daily life patterns"
     },
     "physical_description": "Comprehensive physical description for AI image generation including: facial hair (for men: beard/mustache/clean-shaven), hair style and any hair loss patterns, distinctive facial features (nose size, ear prominence, jaw type, etc.), attractiveness level, build/height based on BMI and fitness, clothing style reflecting occupation/income, overall appearance. Be specific about less conventional features - not everyone is conventionally attractive. Include details like receding hairline, full beard, prominent nose, thin build etc.",
    "motivation_summary": "Concise description of top motivational drivers from motivation_profile.primary_drivers and how goal_orientation manifests in daily decisions",
    "goal_priorities": "Format: goal_name (intensity); goal_name (intensity) - from motivation_profile.goal_orientation.primary_goals",
    "want_vs_should_pattern": "Summary of motivation_profile.want_vs_should_tension patterns and typical resolution style",
    "relationship_dynamics": "Summary of relationships.household status, friend_network patterns, and caregiving roles", 
    "health_and_lifestyle": "Summary combining health_profile conditions, fitness level, substance use, and daily_life.primary_activities balance",
    "financial_context": "Summary of money_profile.attitude_toward_money, spending_style, and key financial stressors or strengths",
    "communication_style": {
      "directness": "exact from communication_style.voice_foundation.directness",
      "formality": "exact from communication_style.voice_foundation.formality",
      "regional_markers": "exact array from communication_style.regional_register.dialect_hints",
      "humor_approach": "summary from humor_profile.style and frequency",
      "authenticity_markers": "exact from communication_style.authenticity_filters.personality_anchors"
    },
    "emotional_landscape": "Concise summary combining emotional_profile triggers (positive/negative/explosive) with emotional_regulation style",
    "honesty_and_bias": "Summary of truth_honesty_profile.baseline_honesty, situational_variance patterns, and key bias_profile.cognitive tendencies",
    "worldview_summary": "Synthesis of attitude_narrative and political_narrative into coherent worldview description",
    "adoption_characteristics": "Summary of adoption_profile including risk_tolerance, change_friction, and typical objection patterns"
  }
}

CRITICAL REQUIREMENTS:
- Summaries must accurately reflect the V4 persona structure, not legacy fields
- Extract exact values where specified for communication_style fields
- Make summaries concise but capture essential behavioral patterns
- Ensure background_description synthesizes multiple categories into coherent narrative
- Generate realistic physical description based on demographics, health, and lifestyle
- Include details useful for AI image generation
- Focus on how traits manifest in conversation and decision-making
- Return ONLY the JSON object, no explanations or markdown`
          },
          {
            role: 'user',
            content: `Generate summaries for this V4 persona:\n\n${JSON.stringify(persona.full_profile, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    const openaiData = await openaiResponse.json()
    console.log('Summary generation complete')

    const rawContent = openaiData.choices[0].message.content
    console.log('Raw OpenAI summary content length:', rawContent.length)

    const cleanedContent = extractJSONFromMarkdown(rawContent)
    console.log('Cleaned summary content for parsing')

    let summaryData
    try {
      summaryData = JSON.parse(cleanedContent)
      console.log('Successfully parsed summary JSON')
    } catch (parseError) {
      console.error('Summary JSON parsing failed:', parseError)
      console.error('Summary content that failed to parse:', cleanedContent.slice(0, 500))
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