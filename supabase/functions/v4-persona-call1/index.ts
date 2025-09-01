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
            content: `Generate a complete V4 persona with all trait categories. Return ONLY valid JSON without any markdown formatting, explanations, or code blocks.

Create a realistic, internally consistent persona with these exact structure:

{
  "full_profile": {
    "identity": {
      "name": "First Last",
      "age": 25-80,
      "gender": "Male/Female/Non-binary",
      "pronouns": "he/him/she/her/they/them",
      "ethnicity": "specific ethnicity",
      "nationality": "US/Canadian/British/etc",
      "location": {"city": "City", "region": "State", "country": "Country"},
      "occupation": "Specific job title",
      "relationship_status": "married/single/divorced/partnered",
      "dependents": 0-5
    },
    "physical_profile": {
      "height": "specific height (e.g., 5'8\", 6'2\")",
      "build": "slim/athletic/average/stocky/overweight/obese/muscular",
      "hair": "detailed hair description (color, length, style, texture)",
      "eyes": "eye color and characteristics",
      "skin_tone": "specific skin tone description",
      "facial_features": "distinctive facial characteristics",
      "clothing_style": "typical dress style and preferences",
      "notable_characteristics": "any distinctive physical traits, posture, mannerisms"
    },
    "motivation_profile": {
      "primary_drivers": {
        "self_interest": 0.1-0.9,
        "family": 0.1-0.9,
        "status": 0.1-0.9,
        "mastery": 0.1-0.9,
        "care": 0.1-0.9,
        "security": 0.1-0.9,
        "belonging": 0.1-0.9,
        "novelty": 0.1-0.9,
        "meaning": 0.1-0.9
      },
      "goal_orientation": {
        "strength": 0.1-0.9,
        "time_horizon": "short_term/medium_term/long_term/mixed",
        "primary_goals": [
          {"goal": "specific goal", "intensity": 1-10, "timeframe": "6_months/1_year/5_years"}
        ],
        "goal_flexibility": 0.1-0.9
      },
      "want_vs_should_tension": {
        "default_resolution": "want_wins/should_wins/context_dependent",
        "major_conflicts": [
          {
            "want": "what they want to do",
            "should": "what they think they should do", 
            "trigger_conditions": ["condition1", "condition2"],
            "typical_resolution": "how they usually resolve it"
          }
        ]
      }
    },
    "inhibitor_profile": {
      "social_cost_sensitivity": 0.1-0.9,
      "consequence_aversion": 0.1-0.9,
      "confidence_level": 0.1-0.9,
      "confirmation_bias": 0.1-0.9,
      "honesty_flexibility": 0.1-0.9,
      "mental_health_factors": ["stable/anxiety/depression/adhd/ptsd"],
      "learned_avoidance": {"domain": 0.1-0.9},
      "perfectionism": 0.1-0.9
    },
    "truth_honesty_profile": {
      "baseline_honesty": 0.1-0.9,
      "self_interest_override": 0.1-0.9,
      "confirmation_bias_strength": 0.1-0.9,
      "truth_flexibility_by_context": {
        "family": 0.1-0.9,
        "friends": 0.1-0.9,
        "work": 0.1-0.9,
        "strangers": 0.1-0.9,
        "authority": 0.1-0.9
      },
      "lie_types_willing": ["white_lies/omission/exaggeration/strategic_deception"]
    },
    "identity_salience": {
      "political_identity": {
        "orientation": "conservative/liberal/libertarian/apolitical/moderate",
        "strength": 0.1-0.9,
        "key_issues": ["issue1", "issue2", "issue3"],
        "tribal_loyalty": 0.1-0.9
      },
      "community_identities": [
        {
          "type": "veteran/parent/religious/ethnic/professional",
          "salience": 0.1-0.9,
          "triggers": ["trigger1", "trigger2"]
        }
      ],
      "cultural_background": "detailed cultural context description"
    },
    "knowledge_profile": {
      "education_level": "high_school/some_college/bachelors/masters/doctorate",
      "vocabulary_ceiling": "working_class/professional/academic",
      "expertise_domains": ["domain1", "domain2", "domain3"],
      "knowledge_gaps": ["gap1", "gap2"],
      "learning_style": "hands_on/theoretical/social/mixed",
      "source_preferences": ["personal_experience/youtube/books/podcasts/news"]
    },
    "daily_life": {
      "primary_activities": {
        "work": 6-10,
        "family_time": 0-6,
        "personal_interests": 0-4,
        "social_interaction": 0-4,
        "personal_care": 0-3
      },
      "screen_time_summary": "Detailed description: Watches [platform] X hrs daily ([specific shows]); [social media] Y hrs ([content type]); [news source] Z hrs",
      "mental_preoccupations": ["preoccupation1", "preoccupation2", "preoccupation3"]
    },
    "communication_style": {
      "voice_foundation": {
        "directness_level": "blunt/direct/balanced/diplomatic/indirect",
        "formality_default": "very_casual/casual/neutral/formal/very_formal",
        "emotional_expression": "controlled/moderate/expressive/dramatic",
        "pace_rhythm": "clipped_military/relaxed_southern/rapid_urban/measured_academic"
      },
      "linguistic_signature": {
        "sentence_patterns": ["pattern1", "pattern2"],
        "signature_phrases": ["phrase1", "phrase2", "phrase3"],
        "typical_openers": ["opener1", "opener2"],
        "conversation_enders": ["ender1", "ender2"]
      },
      "lexical_profile": {
        "vocabulary_level": "working_class_direct/professional_polished/academic_precise",
        "regional_markers": ["marker1", "marker2"],
        "domain_jargon": ["jargon1", "jargon2", "jargon3"],
        "intensifiers": ["intensifier1", "intensifier2"],
        "hedging_language": ["hedge1", "hedge2"] or ["none"]
      },
      "response_architecture": {
        "opinion_structure": "stance_evidence_action/context_nuance_conclusion",
        "advice_structure": "goal_steps_checks/explore_options_reflect",
        "criticism_structure": "problem_evidence_solution/acknowledge_concern_suggest",
        "storytelling_structure": "context_obstacle_resolution/character_journey_lesson"
      },
      "authenticity_filters": {
        "forbidden_phrases": ["phrase1", "phrase2", "phrase3"],
        "required_elements": ["specific_example", "personal_relevance", "concrete_detail"],
        "personality_anchors": ["anchor1", "anchor2", "anchor3"]
      }
    },
    "emotional_profile": {
      "positive_triggers": ["trigger1", "trigger2", "trigger3"],
      "negative_triggers": ["trigger1", "trigger2", "trigger3"],
      "explosive_triggers": ["trigger1", "trigger2"],
      "emotional_regulation": "high_control/moderate_control/low_control",
      "stress_responses": ["response1", "response2"]
    },
    "contradictions": {
      "primary_tension": {
        "description": "Detailed description of main contradiction",
        "trigger_conditions": ["condition1", "condition2"],
        "manifestation": "How this contradiction shows up in behavior"
      },
      "secondary_tensions": [
        {
          "belief": "What they believe",
          "conflicting_behavior": "How they actually behave",
          "context_triggers": ["trigger1", "trigger2"]
        }
      ]
    },
    "sexuality_profile": {
      "orientation": "heterosexual/homosexual/bisexual/asexual/pansexual",
      "expression_style": "private/selective/open",
      "relationship_norms": "monogamous/polyamorous/casual/traditional",
      "boundaries": {
        "topics_off_limits": ["topic1", "topic2"],
        "comfort_level": "conservative/moderate/liberal"
      },
      "linguistic_influences": {
        "flirtation_style": "none/subtle/direct",
        "humor_boundaries": "clean/suggestive/explicit",
        "taboo_navigation": "avoid/navigate_carefully/comfortable"
      }
    }
  }
}

CRITICAL INSTRUCTIONS:
- Avoid midline values (0.5) - create distinctive personalities
- Ensure internal consistency across all traits
- Create realistic contradictions and tensions
- Make communication style unique and specific to this person
- Generate diverse, authentic personas representing full human range
- PHYSICAL PROFILE: Extract ALL physical characteristics mentioned in the user prompt
- Include weight/body type information explicitly (overweight, slim, muscular, etc.)
- Make physical appearance consistent with lifestyle, occupation, and health conditions
- Pay special attention to user-provided physical details
- Return ONLY the JSON object, no explanations or markdown`
          },
          {
            role: 'user',
            content: user_prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
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