import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Optimized OpenAI Helper with model fallback
async function generateChatResponse(
  messages: any[], 
  apiKey: string, 
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    max_completion_tokens?: number;
  }
): Promise<any> {
  const primaryModel = options?.model || 'gpt-4.1-2025-04-14';
  const fallbackModel = 'gpt-4o-mini';
  
  for (const model of [primaryModel, fallbackModel]) {
    try {
      const isNewerModel = model.includes('gpt-5') || model.includes('o3') || model.includes('o4');
      
      const requestBody: any = {
        model,
        messages,
      };

      if (!isNewerModel && options?.temperature !== undefined) {
        requestBody.temperature = options.temperature;
      }

      if (options?.max_completion_tokens && isNewerModel) {
        requestBody.max_completion_tokens = options.max_completion_tokens;
      } else if (options?.max_tokens) {
        requestBody.max_tokens = options.max_tokens;
      } else {
        requestBody.max_tokens = 4000;
      }

      console.log(`🤖 Attempting OpenAI call with model: ${model}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ OpenAI API error with ${model}:`, errorData);
        if (model === fallbackModel) {
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }
        continue; // Try fallback model
      }

      const result = await response.json();
      console.log(`✅ OpenAI call successful with model: ${model}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Error with model ${model}:`, error);
      if (model === fallbackModel) {
        throw error;
      }
      continue; // Try fallback model
    }
  }
}

// Single comprehensive persona generation
async function generateCompletePersonaV3(prompt: string): Promise<any> {
  console.log('🚀 Starting single-call V3 persona generation...');
  
  const messages = [
    {
      role: "system",
      content: `You are a comprehensive persona generator. Create a complete PersonaV3 structure in a single response.

CRITICAL REQUIREMENTS:
1. Generate COMPLETE PersonaV3 structure with ALL required fields
2. Use realistic, non-default values (avoid 0.5 for personality traits)
3. Emotional triggers MUST be: { positive: string[], negative: string[], explosive: string[] }
4. Include ALL 8 cognitive profile categories: big_five, extended_traits, intelligence, decision_style, behavioral_economics, moral_foundations, social_identity, political_orientation
5. Generate realistic interview responses (at least 2 sections with 3+ questions each)
6. Return ONLY valid JSON - no markdown, no explanations

PERSONA STRUCTURE:
{
  "persona_id": "generated-uuid",
  "id": "generated-uuid", 
  "name": "Full Name",
  "description": "Brief description",
  "version": "3.0",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp", 
  "user_id": "placeholder",
  "is_public": false,
  "profile_image_url": null,
  "prompt": "user prompt",
  
  "identity": {
    "age": 25-65,
    "gender": "realistic gender",
    "pronouns": "matching pronouns",
    "ethnicity": "specific ethnicity",
    "nationality": "specific country",
    "occupation": "specific job title",
    "relationship_status": "single/married/divorced/etc",
    "dependents": 0-3,
    "location": {
      "city": "specific city",
      "region": "state/province", 
      "country": "country name"
    },
    "socioeconomic_context": {
      "income_level": "low/medium/high/very_high",
      "education_level": "high_school/bachelors/masters/phd",
      "social_class_identity": "working_class/middle_class/upper_middle_class/upper_class",
      "political_affiliation": "specific affiliation",
      "religious_affiliation": "specific religion or none",
      "religious_practice_level": "low/medium/high",
      "cultural_background": "specific background",
      "cultural_dimensions": {
        "power_distance": 0.1-0.9,
        "individualism_vs_collectivism": 0.1-0.9,
        "masculinity_vs_femininity": 0.1-0.9,
        "uncertainty_avoidance": 0.1-0.9,
        "long_term_orientation": 0.1-0.9,
        "indulgence_vs_restraint": 0.1-0.9
      }
    }
  },
  
  "life_context": {
    "supports": ["specific support 1", "specific support 2"],
    "stressors": ["specific stressor 1", "specific stressor 2"],
    "daily_routine": "detailed daily routine",
    "current_situation": "current life situation",
    "background_narrative": "detailed background story",
    "lifestyle": "lifestyle description"
  },
  
  "knowledge_profile": {
    "general_knowledge_level": "low/medium/high",
    "tech_literacy": "low/medium/high",
    "domains_of_expertise": ["expertise 1", "expertise 2"],
    "knowledge_domains": {
      "arts": 1-10, "health": 1-10, "sports": 1-10, "finance": 1-10, "history": 1-10,
      "science": 1-10, "business": 1-10, "politics": 1-10, "technology": 1-10, "entertainment": 1-10
    }
  },
  
  "cognitive_profile": {
    "big_five": {
      "openness": 0.1-0.9, "neuroticism": 0.1-0.9, "extraversion": 0.1-0.9,
      "agreeableness": 0.1-0.9, "conscientiousness": 0.1-0.9
    },
    "extended_traits": {
      "empathy": 0.1-0.9, "self_efficacy": 0.1-0.9, "cognitive_flexibility": 0.1-0.9,
      "impulse_control": 0.1-0.9, "attention_pattern": 0.1-0.9, "manipulativeness": 0.1-0.9,
      "need_for_cognitive_closure": 0.1-0.9, "institutional_trust": 0.1-0.9
    },
    "intelligence": {
      "type": ["analytical/creative/emotional/practical"],
      "level": "low/medium/high"
    },
    "decision_style": "logical/intuitive/mixed",
    "behavioral_economics": {
      "present_bias": 0.1-0.9, "loss_aversion": 0.1-0.9, "overconfidence": 0.1-0.9,
      "risk_sensitivity": 0.1-0.9, "scarcity_sensitivity": 0.1-0.9
    },
    "moral_foundations": {
      "care_harm": 0.1-0.9, "fairness_cheating": 0.1-0.9, "loyalty_betrayal": 0.1-0.9,
      "authority_subversion": 0.1-0.9, "sanctity_degradation": 0.1-0.9, "liberty_oppression": 0.1-0.9
    },
    "social_identity": {
      "identity_strength": 0.1-0.9, "ingroup_bias_tendency": 0.1-0.9, "outgroup_bias_tendency": 0.1-0.9,
      "cultural_intelligence": 0.1-0.9, "system_justification": 0.1-0.9
    },
    "political_orientation": {
      "authoritarian_libertarian": -1.0 to 1.0, "economic": -1.0 to 1.0,
      "cultural_progressive_conservative": -1.0 to 1.0
    },
    "worldview_summary": "detailed worldview description"
  },
  
  "memory": {
    "persistence": { "long_term": 0.6-0.9, "short_term": 0.3-0.8 },
    "long_term_events": [
      {
        "event": "specific formative event",
        "valence": "positive/negative",
        "timestamp": "age or date when it happened",
        "recall_cues": ["cue1", "cue2"],
        "impact_on_behavior": "how it affects behavior now"
      }
    ],
    "short_term_slots": 3-7
  },
  
  "state_modifiers": {
    "current_state": {
      "fatigue": 0.1-0.8, "acute_stress": 0.1-0.7, "mood_valence": 0.2-0.8,
      "social_safety": 0.3-0.9, "time_pressure": 0.1-0.7
    },
    "state_to_shift_rules": [
      {
        "when": {"stress": ">0.7"},
        "shift": {"hedge_rate": "+0.2", "sentence_length": "-0.1"}
      }
    ]
  },
  
  "linguistic_style": {
    "base_voice": {
      "formality": "casual/formal/mixed", "verbosity": "concise/moderate/verbose",
      "directness": "direct/indirect/balanced", "politeness": "low/medium/high"
    },
    "syntax_and_rhythm": {
      "complexity": "simple/compound/complex",
      "disfluencies": ["um", "uh", "like"],
      "signature_phrases": ["phrase1", "phrase2"],
      "avg_sentence_tokens": {"baseline_max": 15-25, "baseline_min": 8-15}
    },
    "anti_mode_collapse": {
      "forbidden_frames": ["At the end of the day", "It's clear that", "Overall"],
      "must_include_one_of": {
        "advice": ["suggest", "recommend"], "opinion": ["perspective", "view"]
      }
    },
    "lexical_preferences": {
      "hedges": ["I think", "maybe", "perhaps"],
      "modal_verbs": ["could", "might", "should"],
      "affect_words": {"negative_bias": 0.1-0.7, "positive_bias": 0.3-0.9}
    },
    "response_shapes_by_intent": {
      "story": ["This reminds me", "I once"], "advice": ["You might", "Consider"],
      "opinion": ["I believe", "From my view"]
    }
  },
  
  "group_behavior": {
    "assertiveness": "low/medium/high",
    "interruption_tolerance": "low/medium/high",
    "self_disclosure_rate": "low/medium/high"
  },
  
  "social_cognition": {
    "empathy": "low/medium/high",
    "theory_of_mind": "low/medium/high",
    "conflict_orientation": "avoidant/collaborative/competitive"
  },
  
  "sexuality_profile": {
    "orientation": "heterosexual/homosexual/bisexual/other",
    "expression": "private/selective/open",
    "flirtatiousness": "low/medium/high",
    "libido_level": "low/medium/high", 
    "relationship_norms": "monogamous/polyamorous/casual"
  },
  
  "emotional_triggers": {
    "positive": ["achievement", "recognition", "helping others"],
    "negative": ["criticism", "unfairness", "being ignored"],
    "explosive": ["betrayal", "threats to family", "personal attacks"]
  },
  
  "runtime_controls": {
    "style_weights": {"cognition": 0.2-0.6, "knowledge": 0.1-0.4, "linguistics": 0.2-0.5},
    "token_budgets": {"max": 150-300, "min": 30-80},
    "variability_profile": {"turn_to_turn": 0.1-0.4, "session_to_session": 0.2-0.5}
  },
  
  "interview_sections": [
    {
      "section_title": "Personal Background",
      "responses": [
        {"question": "Tell me about yourself", "answer": "detailed personal answer"},
        {"question": "What's important to you?", "answer": "values-based answer"},
        {"question": "Describe your typical day", "answer": "routine description"}
      ]
    },
    {
      "section_title": "Work and Career", 
      "responses": [
        {"question": "What do you do for work?", "answer": "career description"},
        {"question": "What motivates you professionally?", "answer": "motivation answer"},
        {"question": "Where do you see your career going?", "answer": "future goals"}
      ]
    }
  ]
}`
    },
    {
      role: "user",
      content: `Create a complete PersonaV3 based on this prompt: "${prompt}"`
    }
  ];

  console.log('📤 Sending comprehensive generation request...');
  
  const response = await generateChatResponse(messages, openAIApiKey!, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.8,
    max_tokens: 4000
  });

  const content = response.choices[0].message.content.trim();
  console.log('📥 Received response, parsing JSON...');
  
  try {
    // Clean the response - remove any markdown formatting
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const personaData = JSON.parse(cleanContent);
    
    // Generate proper UUIDs
    const personaId = crypto.randomUUID();
    personaData.persona_id = personaId;
    personaData.id = personaId;
    personaData.created_at = new Date().toISOString();
    personaData.updated_at = new Date().toISOString();
    personaData.prompt = prompt;
    
    console.log('✅ Successfully parsed complete PersonaV3 structure');
    console.log('📊 Generated persona:', personaData.name, '- Age:', personaData.identity?.age);
    
    return personaData;
    
  } catch (parseError) {
    console.error('❌ JSON parsing failed:', parseError);
    console.log('🔍 Raw content:', content.slice(0, 500) + '...');
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
    throw new Error(`Failed to parse persona JSON: ${errorMessage}`);
  }
}

// Generate persona description
function generatePersonaDescription(personaData: any): string {
  const identity = personaData.identity;
  const cognitive = personaData.cognitive_profile;
  
  if (!identity || !cognitive) {
    return `${personaData.name} - A unique persona with distinct characteristics.`;
  }
  
  const traits = [];
  const bigFive = cognitive.big_five;
  
  if (bigFive.extraversion > 0.6) traits.push('outgoing');
  else if (bigFive.extraversion < 0.4) traits.push('introverted');
  
  if (bigFive.openness > 0.6) traits.push('creative');
  if (bigFive.conscientiousness > 0.6) traits.push('organized');
  if (bigFive.agreeableness > 0.6) traits.push('cooperative');
  if (bigFive.neuroticism > 0.6) traits.push('sensitive');
  
  const traitStr = traits.length > 0 ? `, ${traits.join(' and ')}` : '';
  
  return `${personaData.name} is a ${identity.age}-year-old ${identity.occupation} from ${identity.location.city}, ${identity.location.country}${traitStr}. ${cognitive.worldview_summary}`;
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting optimized V3 persona generation...');
    const startTime = Date.now();
    
    const { prompt } = await req.json();
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log(`📝 User prompt: "${prompt.slice(0, 100)}..."`);

    // Single comprehensive generation call
    const personaData = await generateCompletePersonaV3(prompt);
    
    // Generate description
    const description = generatePersonaDescription(personaData);
    personaData.description = description;

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ V3 Persona generation completed successfully!');
    console.log(`⏱️ Total generation time: ${duration}ms`);
    console.log(`👤 Generated: ${personaData.name} (${personaData.identity?.occupation})`);
    
    return new Response(JSON.stringify(personaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Persona generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to generate persona - check edge function logs for details'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});