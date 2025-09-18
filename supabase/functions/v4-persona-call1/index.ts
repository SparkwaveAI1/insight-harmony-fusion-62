import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation system integration
const PERSONA_SCHEMA = {
  type: "object",
  required: [
    "identity", "daily_life", "health_profile", "relationships", "money_profile",
    "motivation_profile", "communication_style", "humor_profile", "truth_honesty_profile",
    "bias_profile", "cognitive_profile", "emotional_profile", "attitude_narrative",
    "political_narrative", "adoption_profile", "prompt_shaping", "sexuality_profile"
  ],
  additionalProperties: false
};

const BANNED_KEYS = [
  'big_five', 'social_identity', 'inhibitor_profile', 'cultural_dimensions', 
  'behavioral_economics', 'identity_salience', 'knowledge_profile', 'contradictions',
  'attitude_snapshot', 'political_signals', 'linguistic_signature', 'signature_phrases',
  'physical_profile'
];

function validatePersona(persona: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  function checkForBannedKeys(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (BANNED_KEYS.includes(key)) {
        errors.push(`Banned key found: ${currentPath}`);
      }
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkForBannedKeys(value, currentPath);
      }
    }
  }

  checkForBannedKeys(persona);

  for (const field of PERSONA_SCHEMA.required) {
    if (!persona[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
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
    const { user_prompt, user_id } = await req.json()
    
    console.log('Starting V4 Call 1 - New compliant persona generation')
    console.log('User prompt:', user_prompt)
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found')
      throw new Error('OpenAI API key not configured')
    }

    // Call OpenAI to generate compliant V4 persona with enhanced parameters
    let openaiResponse
    try {
      console.log('Attempting persona generation with gpt-4o-mini (12K tokens)...')
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `Generate a complete V4 persona that EXACTLY follows the new validation schema. Return ONLY valid JSON without any markdown formatting, explanations, or code blocks.

CRITICAL: The response must include ALL required fields and NEVER include any banned fields.

REQUIRED FIELDS (ALL MUST BE PRESENT):
- identity, daily_life, health_profile, relationships, money_profile
- motivation_profile, communication_style, humor_profile, truth_honesty_profile
- bias_profile, cognitive_profile, emotional_profile, attitude_narrative
- political_narrative, adoption_profile, prompt_shaping, sexuality_profile

BANNED FIELDS (NEVER INCLUDE):
- big_five, social_identity, inhibitor_profile, cultural_dimensions
- behavioral_economics, identity_salience, knowledge_profile, contradictions
- attitude_snapshot, political_signals, linguistic_signature, signature_phrases
- physical_profile

Generate this EXACT structure:

{
  "identity": {
    "name": "First Last",
    "age": 25-75,
    "gender": "Male/Female/Non-binary",
    "pronouns": "he/him/she/her/they/them",
    "ethnicity": "specific ethnicity",
    "nationality": "specific nationality",
    "occupation": "specific job title",
    "relationship_status": "single/married/divorced/partnered",
    "dependents": 0-3,
    "education_level": "high_school/some_college/bachelors/masters/doctorate",
    "income_bracket": "$20k-30k/$30k-50k/$50k-75k/$75k-100k/$100k+",
    "location": {
      "city": "City Name",
      "region": "State/Province", 
      "country": "Country Name",
      "urbanicity": "urban/suburban/rural"
    }
  },
  "daily_life": {
    "primary_activities": {
      "work": 6-10,
      "family_time": 0-6,
      "personal_care": 1-3,
      "personal_interests": 0-4,
      "social_interaction": 0-4
    },
    "schedule_blocks": [
      {"start": "08:00", "end": "17:00", "activity": "work", "setting": "office"},
      {"start": "18:00", "end": "20:00", "activity": "family time", "setting": "home"}
    ],
    "time_sentiment": {
      "work": "fulfilling/neutral/stressful",
      "family": "energizing/balanced/draining", 
      "personal": "restorative/rushed/neglected"
    },
    "screen_time_summary": "Detailed description of daily screen use",
    "mental_preoccupations": ["preoccupation1", "preoccupation2", "preoccupation3"]
  },
  "health_profile": {
    "bmi_category": "underweight/normal/overweight/obese",
    "chronic_conditions": ["condition1", "condition2"] or [],
    "mental_health_flags": ["anxiety/depression/adhd"] or [],
    "medications": ["medication1", "medication2"] or [],
    "adherence_level": "excellent/good/poor/inconsistent",
    "sleep_hours": 5-9,
    "substance_use": {
      "alcohol": "none/social/regular/heavy",
      "cigarettes": "none/social/regular/heavy",
      "vaping": "none/occasional/regular",
      "marijuana": "none/occasional/regular"
    },
    "fitness_level": "sedentary/low/moderate/high/athletic",
    "diet_pattern": "standard/health_conscious/restricted/irregular"
  },
  "relationships": {
    "household": {
      "status": "alone/partner/family/roommates",
      "harmony_level": "tense/neutral/harmonious",
      "dependents": 0-3
    },
    "caregiving_roles": ["elderly_parent", "children", "pets"] or [],
    "friend_network": {
      "size": "small/medium/large",
      "frequency": "daily/weekly/monthly/rare",
      "anchor_contexts": ["work", "neighborhood", "hobbies", "family"]
    },
    "pets": [{"type": "dog/cat/bird", "name": "pet_name"}] or []
  },
  "money_profile": {
    "attitude_toward_money": "anxious/practical/optimistic/indifferent",
    "earning_context": "stable/unstable/growing/declining",
    "spending_style": "frugal/balanced/impulsive/luxury_focused",
    "savings_investing_habits": {
      "emergency_fund_months": 0-12,
      "retirement_contributions": "none/minimal/adequate/aggressive",
      "investing_style": "conservative/balanced/aggressive/none"
    },
    "debt_posture": "debt_free/manageable/struggling/overwhelmed",
    "financial_stressors": ["housing", "healthcare", "education"] or [],
    "money_conflicts": "none/minor/moderate/severe",
    "generosity_profile": "stingy/selective/generous/very_generous"
  },
  "motivation_profile": {
    "primary_motivation_labels": ["achievement", "security", "relationships"],
    "deal_breakers": ["dishonesty", "disrespect", "injustice"],
    "primary_drivers": {
      "care": 0.1-0.9,
      "family": 0.1-0.9,
      "status": 0.1-0.9,
      "mastery": 0.1-0.9,
      "meaning": 0.1-0.9,
      "novelty": 0.1-0.9,
      "security": 0.1-0.9,
      "belonging": 0.1-0.9,
      "self_interest": 0.1-0.9
    },
    "goal_orientation": {
      "strength": 0.1-0.9,
      "time_horizon": "short_term/medium_term/long_term",
      "primary_goals": [
        {"goal": "specific goal", "intensity": 1, "timeframe": "1_year"},
        {"goal": "another goal", "intensity": 1, "timeframe": "5_years"}
      ],
      "goal_flexibility": 0.1-0.9
    },
    "want_vs_should_tension": {
      "major_conflicts": [
        {
          "want": "what they want",
          "should": "what they think they should do",
          "trigger_conditions": ["condition1", "condition2"],
          "typical_resolution": "how they resolve it"
        }
      ],
      "default_resolution": "want_wins/should_wins/context_dependent"
    }
  },
  "communication_style": {
    "regional_register": {
      "region": "Northeast/South/Midwest/West/International",
      "urbanicity": "urban/suburban/rural",
      "dialect_hints": ["hint1", "hint2"] or []
    },
    "voice_foundation": {
      "formality": "very_casual/casual/neutral/formal/very_formal",
      "directness": "blunt/direct/balanced/diplomatic/indirect",
      "pace_rhythm": "rapid/moderate/measured/slow",
      "positivity": "pessimistic/realistic/optimistic/very_positive",
      "empathy_level": 0.1-0.9,
      "honesty_style": "brutal/direct/tactful/diplomatic",
      "charisma_level": 0.1-0.9
    },
    "style_markers": {
      "metaphor_domains": ["sports", "cooking", "nature"] or [],
      "aphorism_register": "folksy/professional/philosophical/none",
      "storytelling_vs_bullets": 0.1-0.9,
      "humor_style": "dry/sarcastic/warm/silly/none",
      "code_switching_contexts": ["work", "family", "friends"] or []
    },
    "context_switches": {
      "work": {"formality": "formal", "directness": "diplomatic"},
      "home": {"formality": "casual", "directness": "direct"},
      "online": {"formality": "neutral", "directness": "balanced"}
    },
    "authenticity_filters": {
      "avoid_registers": ["corporate_speak", "academic_jargon"],
      "embrace_registers": ["plain_spoken", "experiential"],
      "personality_anchors": ["practical", "caring", "honest"]
    }
  },
  "humor_profile": {
    "frequency": "rare/occasional/frequent/constant",
    "style": ["dry", "sarcastic", "warm", "observational"],
    "boundaries": ["no_dark_humor", "no_self_deprecation"] or [],
    "targets": ["self", "situations", "others_gently"] or [],
    "use_cases": ["tension_relief", "bonding", "deflection"]
  },
  "truth_honesty_profile": {
    "baseline_honesty": 0.1-0.9,
    "situational_variance": {
      "work": 0.1-0.9,
      "home": 0.1-0.9,
      "public": 0.1-0.9
    },
    "typical_distortions": ["white_lies", "omission", "exaggeration"] or [],
    "red_lines": ["never_lie_about_safety", "protect_family"],
    "pressure_points": ["financial_stress", "social_embarrassment"],
    "confession_style": "immediate/delayed/never/contextual"
  },
  "bias_profile": {
    "cognitive": {
      "status_quo": 0.1-0.9,
      "loss_aversion": 0.1-0.9,
      "confirmation": 0.1-0.9,
      "anchoring": 0.1-0.9,
      "availability": 0.1-0.9,
      "optimism": 0.1-0.9,
      "sunk_cost": 0.1-0.9,
      "overconfidence": 0.1-0.9
    },
    "mitigations": ["seeks_diverse_opinions", "double_checks_facts"] or []
  },
  "cognitive_profile": {
    "verbal_fluency": 0.1-0.9,
    "abstract_reasoning": 0.1-0.9,
    "problem_solving_orientation": "methodical/intuitive/collaborative/avoidant",
    "thought_coherence": 0.1-0.9
  },
  "emotional_profile": {
    "stress_responses": ["withdraw", "seek_support", "become_irritable"],
    "negative_triggers": ["criticism", "unfairness", "chaos"],
    "positive_triggers": ["achievement", "recognition", "helping_others"],
    "explosive_triggers": ["betrayal", "threats_to_family"] or [],
    "emotional_regulation": "excellent/good/fair/poor"
  },
  "attitude_narrative": "A comprehensive 2-3 sentence description of their overall outlook on life, core values, and general approach to challenges and opportunities.",
  "political_narrative": "A 2-3 sentence description of their political views, civic engagement level, and how politics fits into their identity and daily life.",
  "adoption_profile": {
    "buyer_power": 0.1-0.9,
    "adoption_influence": 0.1-0.9,
    "risk_tolerance": 0.1-0.9,
    "change_friction": 0.1-0.9,
    "expected_objections": ["cost_concerns", "time_investment", "complexity"],
    "proof_points_needed": ["testimonials", "data", "expert_endorsement"]
  },
  "prompt_shaping": {
    "voice_foundation": {
      "formality": "copy from communication_style.voice_foundation.formality",
      "directness": "copy from communication_style.voice_foundation.directness",
      "pace_rhythm": "copy from communication_style.voice_foundation.pace_rhythm",
      "positivity": "copy from communication_style.voice_foundation.positivity",
      "empathy_level": 0.1-0.9
    },
    "style_markers": {
      "metaphor_domains": ["domain1", "domain2"] or [],
      "humor_style": "copy from humor_profile.style[0] or none",
      "storytelling_vs_bullets": 0.1-0.9
    },
    "primary_motivations": ["motivation1", "motivation2", "motivation3"],
    "deal_breakers": ["dealbreaker1", "dealbreaker2"],
    "honesty_vector": {
      "baseline": 0.1-0.9,
      "work": 0.1-0.9,
      "home": 0.1-0.9,
      "public": 0.1-0.9,
      "distortions": ["distortion1", "distortion2"] or []
    },
    "bias_vector": {
      "top_cognitive": ["confirmation", "anchoring"],
      "top_social": ["ingroup_preference", "authority_deference"] or [],
      "mitigation_playbook": ["strategy1", "strategy2"] or []
    },
    "context_switches": {
      "work": "brief description of work communication style",
      "home": "brief description of home communication style", 
      "online": "brief description of online communication style"
    },
    "current_focus": "What is currently occupying most of their mental energy"
  },
  "sexuality_profile": {
    "orientation": "heterosexual/homosexual/bisexual/asexual/pansexual",
    "expression_style": "private/selective/open",
    "relationship_norms": "monogamous/polyamorous/casual/traditional",
    "boundaries": {
      "comfort_level": "conservative/moderate/liberal",
      "topics_off_limits": ["explicit_details", "past_relationships"] or []
    },
    "linguistic_influences": {
      "flirtation_style": "none/subtle/direct",
      "humor_boundaries": "clean/suggestive/explicit",
      "taboo_navigation": "avoid/navigate_carefully/comfortable"
    }
  }
}

CRITICAL INSTRUCTIONS:
- Avoid midline values (0.5) - create distinctive personalities
- Ensure internal consistency across all traits
- Make each field realistic and specific
- Numbers must be between 0 and 1 where specified
- Arrays can be empty [] if appropriate
- Generate diverse, authentic personas
- Return ONLY the JSON object, no explanations or markdown`
            },
            {
              role: 'user',
              content: user_prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 12000,
          response_format: { type: "json_object" }
        })
      })

      // Check if the primary request was successful
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json()
        console.warn('Primary gpt-4o-mini request failed:', errorData.error?.message)
        
        // Fallback to gpt-4o with smaller token limit but higher reliability
        console.log('Attempting fallback with gpt-4o (8K tokens)...')
        openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `Generate a complete V4 persona that EXACTLY follows the new validation schema. Return ONLY valid JSON without any markdown formatting, explanations, or code blocks.

CRITICAL: The response must include ALL required fields and NEVER include any banned fields.

REQUIRED FIELDS (ALL MUST BE PRESENT):
- identity, daily_life, health_profile, relationships, money_profile
- motivation_profile, communication_style, humor_profile, truth_honesty_profile
- bias_profile, cognitive_profile, emotional_profile, attitude_narrative
- political_narrative, adoption_profile, prompt_shaping, sexuality_profile

BANNED FIELDS (NEVER INCLUDE):
- big_five, social_identity, inhibitor_profile, cultural_dimensions
- behavioral_economics, identity_salience, knowledge_profile, contradictions
- attitude_snapshot, political_signals, linguistic_signature, signature_phrases
- physical_profile

Generate the complete persona structure with all fields populated realistically.

CRITICAL INSTRUCTIONS:
- Avoid midline values (0.5) - create distinctive personalities
- Ensure internal consistency across all traits
- Make each field realistic and specific
- Numbers must be between 0 and 1 where specified
- Arrays can be empty [] if appropriate
- Generate diverse, authentic personas
- Return ONLY the JSON object, no explanations or markdown`
              },
              {
                role: 'user',
                content: user_prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 8000,
            response_format: { type: "json_object" }
          })
        })

        if (!openaiResponse.ok) {
          const fallbackErrorData = await openaiResponse.json()
          throw new Error(`Both OpenAI requests failed. Primary: ${errorData.error?.message}, Fallback: ${fallbackErrorData.error?.message}`)
        }
        
        console.log('✅ Fallback gpt-4o request successful')
      } else {
        console.log('✅ Primary gpt-4o-mini request successful')
      }
      
    } catch (fetchError) {
      console.error('OpenAI API request failed:', fetchError)
      throw new Error(`OpenAI API request failed: ${fetchError.message}`)
    }

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received, content length:', openaiData.choices[0].message.content.length)

    const rawContent = openaiData.choices[0].message.content
    console.log('Raw OpenAI response preview:', rawContent.slice(0, 200) + '...')
    console.log('Raw OpenAI response ends with:', rawContent.slice(-100))

    // Enhanced JSON extraction with validation
    const cleanedContent = extractJSONFromMarkdown(rawContent)
    console.log('Cleaned content length:', cleanedContent.length)
    
    // Validate response completeness before parsing
    const trimmedContent = cleanedContent.trim()
    if (!trimmedContent.startsWith('{') || !trimmedContent.endsWith('}')) {
      console.error('Response does not appear to be complete JSON')
      console.error('Starts with:', trimmedContent.slice(0, 50))
      console.error('Ends with:', trimmedContent.slice(-50))
      throw new Error('OpenAI response appears to be truncated or malformed - missing JSON structure')
    }

    let generatedPersona
    try {
      generatedPersona = JSON.parse(cleanedContent)
      console.log('✅ Successfully parsed persona JSON')
      console.log('Parsed persona has keys:', Object.keys(generatedPersona))
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message)
      console.error('Content length:', cleanedContent.length)
      console.error('Content preview (first 500 chars):', cleanedContent.slice(0, 500))
      console.error('Content preview (last 500 chars):', cleanedContent.slice(-500))
      
      // Try to identify the specific issue
      if (cleanedContent.includes('```')) {
        throw new Error('Failed to parse OpenAI response: Response contains markdown formatting that could not be cleaned')
      } else if (cleanedContent.length < 1000) {
        throw new Error('Failed to parse OpenAI response: Response appears to be too short/truncated')
      } else {
        throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`)
      }
    }

    // Validate the generated persona
    console.log('Validating generated persona...')
    const validation = validatePersona(generatedPersona)
    
    if (!validation.isValid) {
      console.error('Generated persona failed validation:', validation.errors)
      throw new Error(`Generated persona is invalid: ${validation.errors.join(', ')}`)
    }
    
    console.log('✅ Generated persona passed validation')
    if (validation.warnings.length > 0) {
      console.log('⚠️ Validation warnings:', validation.warnings)
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
          name: generatedPersona.identity.name,
          user_id: user_id,
          full_profile: generatedPersona,
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
        persona_id: data[0].persona_id,
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