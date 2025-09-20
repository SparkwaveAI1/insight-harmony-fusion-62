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

    // Validate input
    if (!persona_id || typeof persona_id !== 'string') {
      throw new Error('Invalid persona_id provided')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Start background processing immediately and return success
    const backgroundTask = async () => {
      try {
        console.log('Starting background summary generation for:', persona_id)

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

        if (!persona.full_profile) {
          throw new Error('Persona missing full_profile data - Call 1 may not have completed')
        }

        console.log('Retrieved persona for summary generation')

        // Robust OpenAI call with retry logic for different models
        let summaryData
        const models = ['gpt-5-mini-2025-08-07', 'gpt-4.1-2025-04-14']
        let lastError

        for (const model of models) {
          try {
            console.log(`Attempting summary generation with ${model}`)
            
            const requestBody: any = {
              model,
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
- Return ONLY the JSON object, no explanations or markdown
- NEVER truncate or abbreviate - provide complete comprehensive summaries for all fields`
                },
                {
                  role: 'user',
                  content: `Generate summaries for this V4 persona:\n\n${JSON.stringify(persona.full_profile, null, 2)}`
                }
              ]
            }

            // Use appropriate token parameter based on model
            if (model.includes('gpt-5')) {
              requestBody.max_completion_tokens = 5000 // Higher limit for completeness
            } else {
              requestBody.max_completion_tokens = 4000 // GPT-4.1 also uses max_completion_tokens
            }

            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            })

            if (!openaiResponse.ok) {
              const errorData = await openaiResponse.json()
              throw new Error(`OpenAI API error: ${errorData.error?.message || openaiResponse.statusText}`)
            }

            const openaiData = await openaiResponse.json()
            const rawContent = openaiData.choices[0].message.content
            
            console.log(`Summary generation complete with ${model}, content length:`, rawContent.length)

            // Validate we got substantial content
            if (rawContent.length < 500) {
              throw new Error(`Generated content too short (${rawContent.length} chars) - likely truncated`)
            }

            const cleanedContent = extractJSONFromMarkdown(rawContent)
            
            try {
              summaryData = JSON.parse(cleanedContent)
              
              // Validate the structure contains required fields
              if (!summaryData.conversation_summary || 
                  !summaryData.conversation_summary.demographics ||
                  !summaryData.conversation_summary.communication_style) {
                throw new Error('Missing required fields in generated summary')
              }
              
              console.log(`Successfully parsed summary JSON with ${model}`)
              break // Success, exit retry loop
              
            } catch (parseError) {
              console.error(`JSON parsing failed with ${model}:`, parseError)
              console.error('Content that failed to parse:', cleanedContent.slice(0, 500))
              throw new Error(`Failed to parse as JSON: ${parseError.message}`)
            }

          } catch (modelError) {
            console.error(`Model ${model} failed:`, modelError)
            lastError = modelError
            
            // If this isn't the last model, continue to next
            if (model !== models[models.length - 1]) {
              console.log(`Retrying with next model...`)
              continue
            }
          }
        }

        // If we get here without summaryData, all models failed
        if (!summaryData) {
          throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
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

        console.log('Persona updated successfully with complete summaries')

      } catch (backgroundError) {
        console.error('Background processing failed for persona:', persona_id, backgroundError)
        
        // Update persona with error status
        await supabase
          .from('v4_personas')
          .update({
            creation_stage: 'failed',
            creation_completed: false,
            updated_at: new Date().toISOString()
          })
          .eq('persona_id', persona_id)
      }
    }

    // Start background task and return immediately
    EdgeRuntime.waitUntil(backgroundTask())

    return new Response(
      JSON.stringify({ 
        success: true,
        persona_id: persona_id,
        message: 'Summary generation started in background',
        stage: 'processing_summaries'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    // Only fail immediately for fundamental input problems
    console.error('Immediate failure in v4-persona-call2:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        type: 'input_validation_error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})