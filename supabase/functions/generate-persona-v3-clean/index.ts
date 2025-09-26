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
  const model = options?.model || 'gpt-4.1-2025-04-14';
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

  console.log(`🤖 V3-Clean: Calling OpenAI with model: ${model}`);
  
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
    console.error(`❌ V3-Clean OpenAI error:`, errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
}

async function generateV3CleanPersona(prompt: string, userId: string): Promise<any> {
  console.log('🚀 V3-Clean: Starting clean persona generation...');
  
  const messages = [
    {
      role: "system",
      content: `You are a V3-Clean persona generator that creates diverse, authentic personas. 

CRITICAL: Generate complete PersonaV3 structure with authentic diversity:
- Vary ages (25-65), genders, ethnicities, nationalities, occupations  
- Include diverse socioeconomic backgrounds and cultural contexts
- Create realistic personality variations (avoid 0.5 defaults)
- Generate authentic communication styles based on demographics
- Include region-specific speech patterns and cultural references
- Emotional triggers must be simple arrays: { positive: string[], negative: string[], explosive: string[] }

STRUCTURE (return ONLY valid JSON):
{
  "persona_id": "generated-uuid",
  "id": "generated-uuid", 
  "name": "Full Name",
  "description": "Brief description",
  "version": "3.0-clean",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp", 
  "user_id": "${userId}",
  "is_public": false,
  "profile_image_url": null,
  "prompt": "${prompt}",
  
  "identity": {
    "age": 25-65,
    "gender": "realistic diverse gender",
    "pronouns": "matching pronouns",
    "ethnicity": "specific diverse ethnicity",
    "nationality": "specific country",
    "occupation": "specific authentic job",
    "relationship_status": "varied status",
    "dependents": 0-3,
    "location": {
      "city": "specific real city",
      "region": "state/province", 
      "country": "country name"
    },
    "socioeconomic_context": {
      "income_level": "low/medium/high/very_high",
      "education_level": "varied education",
      "social_class_identity": "authentic class",
      "political_affiliation": "realistic affiliation",
      "religious_affiliation": "diverse religion or none",
      "religious_practice_level": "low/medium/high",
      "cultural_background": "authentic background",
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
    "stressors": ["authentic stressor 1", "realistic stressor 2"],
    "daily_routine": "detailed culturally-informed routine",
    "current_situation": "authentic current circumstances",
    "background_narrative": "rich backstory with cultural context",
    "lifestyle": "lifestyle reflecting socioeconomic reality"
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
    "worldview_summary": "authentic worldview reflecting background"
  },
  
  "memory": {
    "persistence": { "long_term": 0.6-0.9, "short_term": 0.3-0.8 },
    "long_term_events": [
      {
        "event": "culturally relevant formative event",
        "valence": "positive/negative",
        "timestamp": "age or date",
        "recall_cues": ["cue1", "cue2"],
        "impact_on_behavior": "behavioral impact"
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
      "formality": "culturally-appropriate formality", 
      "verbosity": "concise/moderate/verbose",
      "directness": "culturally-informed directness", 
      "politeness": "culturally-appropriate politeness"
    },
    "syntax_and_rhythm": {
      "complexity": "education-appropriate complexity",
      "disfluencies": ["realistic disfluencies"],
      "signature_phrases": ["culturally-relevant phrases"],
      "avg_sentence_tokens": {"baseline_max": 15-25, "baseline_min": 8-15}
    },
    "anti_mode_collapse": {
      "forbidden_frames": ["At the end of the day", "It's clear that", "Overall"],
      "must_include_one_of": {
        "advice": ["suggest", "recommend"], "opinion": ["perspective", "view"]
      }
    },
    "lexical_preferences": {
      "hedges": ["culturally-appropriate hedges"],
      "modal_verbs": ["could", "might", "should"],
      "affect_words": {"negative_bias": 0.1-0.7, "positive_bias": 0.3-0.9}
    },
    "response_shapes_by_intent": {
      "story": ["culturally-relevant story starters"], 
      "advice": ["culturally-appropriate advice starters"],
      "opinion": ["authentic opinion expressions"]
    }
  },
  
  "group_behavior": {
    "assertiveness": "culturally-informed assertiveness",
    "interruption_tolerance": "culturally-appropriate tolerance",
    "self_disclosure_rate": "culturally-informed rate"
  },
  
  "social_cognition": {
    "empathy": "personality-based empathy level",
    "theory_of_mind": "cognitive ability level",
    "conflict_orientation": "culturally-informed orientation"
  },
  
  "sexuality_profile": {
    "orientation": "diverse orientations",
    "expression": "private/selective/open",
    "flirtatiousness": "personality-based level",
    "libido_level": "varied level", 
    "relationship_norms": "culturally-informed norms"
  },
  
  "emotional_triggers": {
    "positive": ["culturally-relevant positive triggers"],
    "negative": ["authentic negative triggers"],
    "explosive": ["personality-specific explosive triggers"]
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
        {"question": "Tell me about yourself", "answer": "culturally-informed personal answer"},
        {"question": "What's important to you?", "answer": "values reflecting cultural background"},
        {"question": "Describe your typical day", "answer": "realistic routine description"}
      ]
    },
    {
      "section_title": "Values and Perspectives", 
      "responses": [
        {"question": "What do you believe in?", "answer": "authentic belief system"},
        {"question": "How do you handle challenges?", "answer": "culturally-informed coping"},
        {"question": "What makes you happy?", "answer": "personality-driven happiness"}
      ]
    }
  ]
}`
    },
    {
      role: "user",
      content: `Create a diverse, authentic PersonaV3 based on: "${prompt}"`
    }
  ];

  const response = await generateChatResponse(messages, openAIApiKey!, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 4000
  });

  const content = response.choices[0].message.content.trim();
  console.log('📥 V3-Clean: Parsing response...');
  
  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const personaData = JSON.parse(cleanContent);
    
    // Ensure proper IDs and timestamps
    const personaId = crypto.randomUUID();
    personaData.persona_id = personaId;
    personaData.id = personaId;
    personaData.created_at = new Date().toISOString();
    personaData.updated_at = new Date().toISOString();
    personaData.user_id = userId;
    personaData.version = "3.0-clean";
    personaData.prompt = prompt;
    
    console.log('✅ V3-Clean: Generated persona:', personaData.name, '- Age:', personaData.identity?.age);
    return personaData;
    
  } catch (parseError) {
    console.error('❌ V3-Clean: JSON parsing failed:', parseError);
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
    throw new Error(`Failed to parse V3-Clean persona: ${errorMessage}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 V3-Clean: Starting generation...');
    const startTime = Date.now();
    
    const { prompt, userId } = await req.json();
    if (!prompt || !userId) {
      throw new Error('Prompt and userId are required');
    }

    console.log(`📝 V3-Clean: User ${userId} prompt: "${prompt.slice(0, 100)}..."`);

    const personaData = await generateV3CleanPersona(prompt, userId);
    
    // Generate description
    const identity = personaData.identity;
    const cognitive = personaData.cognitive_profile;
    
    const traits = [];
    const bigFive = cognitive.big_five;
    
    if (bigFive.extraversion > 0.6) traits.push('outgoing');
    else if (bigFive.extraversion < 0.4) traits.push('introverted');
    
    if (bigFive.openness > 0.6) traits.push('creative');
    if (bigFive.conscientiousness > 0.6) traits.push('organized');
    if (bigFive.agreeableness > 0.6) traits.push('cooperative');
    
    const traitStr = traits.length > 0 ? `, ${traits.join(' and ')}` : '';
    
    personaData.description = `${personaData.name} is a ${identity.age}-year-old ${identity.occupation} from ${identity.location.city}, ${identity.location.country}${traitStr}. ${cognitive.worldview_summary}`;

    const duration = Date.now() - startTime;
    
    console.log('✅ V3-Clean: Generation completed!');
    console.log(`⏱️ V3-Clean: Duration: ${duration}ms`);
    console.log(`👤 V3-Clean: Generated ${personaData.name} (${identity.occupation})`);
    
    return new Response(JSON.stringify(personaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ V3-Clean: Generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'V3-Clean generation failed - check logs'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});