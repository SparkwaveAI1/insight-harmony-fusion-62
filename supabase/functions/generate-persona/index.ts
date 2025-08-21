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

// OpenAI Helper
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
  const isNewerModel = options?.model?.includes('gpt-5') || options?.model?.includes('o3') || options?.model?.includes('o4');
  
  const requestBody: any = {
    model: options?.model || 'gpt-4.1-2025-04-14',
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
    requestBody.max_tokens = 2000;
  }

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
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
}

// Input extraction utility
function extractUserDetails(prompt: string): any {
  console.log('🔍 Extracting user details from prompt...');
  
  const nameMatch = prompt.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  const ageMatch = prompt.match(/(\d{2,3})/);
  const occupationMatch = prompt.match(/(?:works as|job|occupation|is a|as a)\s+([^,\.]+)/i);
  const locationMatch = prompt.match(/(?:in|from|lives in|located in)\s+([^,\.]+)/i);
  const educationMatch = prompt.match(/(?:went to|graduated from|studied at)\s+([^,\.]+)/i);
  const familyMatch = prompt.match(/(?:married|wife|husband|spouse|kids|children|family)/i);
  
  const extracted = {
    name: nameMatch ? nameMatch[1] : null,
    age: ageMatch ? parseInt(ageMatch[1]) : null,
    occupation: occupationMatch ? occupationMatch[1].trim() : null,
    location: locationMatch ? locationMatch[1].trim() : null,
    education: educationMatch ? educationMatch[1].trim() : null,
    hasFamily: !!familyMatch,
    fullPrompt: prompt
  };
  
  console.log('✅ Extracted details:', JSON.stringify(extracted, null, 2));
  return extracted;
}

// Generate V3 Identity (Core Demographics)
async function generateV3Identity(prompt: string): Promise<any> {
  console.log('🏗️ Generating V3 identity...');
  
  const userDetails = extractUserDetails(prompt);
  
  const messages = [
    {
      role: "system",
      content: `Create a V3 persona identity by extracting and building upon the user's provided information. 

CRITICAL INSTRUCTIONS:
1. **EXTRACT FIRST**: Identify all explicitly provided details (name, age, occupation, location, background)
2. **USE PROVIDED DATA**: Never override user-specified information
3. **FILL GAPS INTELLIGENTLY**: Only generate data for missing fields, keeping it consistent with provided context
4. **MAKE IT DISTINCTIVE**: Avoid generic values, create memorable characteristics

REQUIRED V3 STRUCTURE (JSON only):
{
  "name": "[Use provided name or generate if missing]",
  "persona_id": "persona-[random-6-chars]", 
  "creation_date": "${new Date().toISOString().split('T')[0]}",
  "identity": {
    "age": [Use provided age or generate 22-65],
    "gender": "[Infer from context or generate]",
    "pronouns": "[Match gender]",
    "ethnicity": "[Extract from background or generate]",
    "nationality": "[Extract from location/background]",
    "occupation": "[Use provided occupation]",
    "relationship_status": "[Extract from family context]",
    "dependents": [Extract from family info],
    "location": {
      "city": "[Extract from provided location]",
      "region": "[State/Province]",
      "country": "[Extract from context]"
    },
    "socioeconomic_context": {
      "income_level": "[Generate realistic for occupation]",
      "education_level": "[Extract or infer from occupation/background]",
      "social_class_identity": "[Infer from income/education/context]",
      "political_affiliation": "[Infer from context clues or generate]",
      "religious_affiliation": "[Extract from background or generate]",
      "religious_practice_level": "[low/medium/high]",
      "cultural_background": "[Extract from ethnicity/location/family]"
    }
  }
}

EXTRACTION PRIORITIES:
- NAME: "${userDetails.name || 'Generate distinctive name'}"
- AGE: ${userDetails.age || 'Generate realistic age 22-65'}
- OCCUPATION: "${userDetails.occupation || 'Generate based on context'}"
- LOCATION: "${userDetails.location || 'Generate realistic location'}"
- EDUCATION: "${userDetails.education || 'Infer from occupation/context'}"
- FAMILY: ${userDetails.hasFamily ? 'Has family/relationships' : 'Determine from context'}

BUILD THE PERSONA around these extracted details. Make them memorable and realistic.`
    },
    {
      role: "user",
      content: `Create V3 identity for this person. Extract all provided information and build a complete identity:

${prompt}

CRITICAL: Use the provided name, age, occupation, location, and background details exactly as given. Only generate missing information.`
    }
  ];

  console.log('📤 Making OpenAI call for identity generation...');
  const response = await generateChatResponse(messages, openAIApiKey, {
    model: 'gpt-5-2025-08-07',
    max_completion_tokens: 1500
  });
  console.log('📥 OpenAI response received for identity');

  const content = response.choices[0].message.content;
  console.log('📄 Raw identity response:', content);

  try {
    const parsed = JSON.parse(content);
    console.log('✅ V3 identity generated:', parsed.name);
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse V3 identity JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 identity');
  }
}

// Generate V3 Cognitive Profile (Big Five + All Trait Categories)
async function generateV3CognitiveProfile(basePersona: any, prompt: string): Promise<any> {
  console.log('🧠 Generating V3 cognitive profile...');
  console.log('🔍 DEBUG: Cognitive generation inputs:', {
    personaName: basePersona.name,
    occupation: basePersona.identity?.occupation,
    age: basePersona.identity?.age,
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 200)
  });
  
  const messages = [
    {
      role: "system",
      content: `Generate a comprehensive V3 cognitive profile with ALL 8 trait categories. Create distinctive, realistic traits that avoid defaults. Return ONLY valid JSON.

CRITICAL: DO NOT use 0.5 as default values! Generate distinctive trait patterns based on persona background.

REQUIRED V3 STRUCTURE:
{
  "cognitive_profile": {
    "big_five": {
      "openness": number_0_to_1,
      "conscientiousness": number_0_to_1,
      "extraversion": number_0_to_1,
      "agreeableness": number_0_to_1,
      "neuroticism": number_0_to_1
    },
    "moral_foundations": {
      "care_harm": number_0_to_1,
      "fairness_cheating": number_0_to_1,
      "loyalty_betrayal": number_0_to_1,
      "authority_subversion": number_0_to_1,
      "sanctity_degradation": number_0_to_1,
      "liberty_oppression": number_0_to_1
    },
    "world_values": {
      "traditional_vs_secular": number_0_to_1,
      "survival_vs_self_expression": number_0_to_1,
      "materialist_vs_postmaterialist": number_0_to_1
    },
    "political_compass": {
      "economic": number_negative1_to_1,
      "authoritarian_libertarian": number_negative1_to_1,
      "cultural_conservative_progressive": number_negative1_to_1,
      "political_salience": number_0_to_1
    },
    "cultural_dimensions": {
      "power_distance": number_0_to_1,
      "individualism_vs_collectivism": number_0_to_1,
      "masculinity_vs_femininity": number_0_to_1,
      "uncertainty_avoidance": number_0_to_1,
      "long_term_orientation": number_0_to_1,
      "indulgence_vs_restraint": number_0_to_1
    },
    "social_identity": {
      "identity_strength": number_0_to_1,
      "ingroup_bias_tendency": number_0_to_1,
      "outgroup_bias_tendency": number_0_to_1,
      "social_dominance_orientation": number_0_to_1
    },
    "behavioral_economics": {
      "present_bias": number_0_to_1,
      "loss_aversion": number_0_to_1,
      "overconfidence": number_0_to_1,
      "risk_sensitivity": number_0_to_1
    },
    "extended_traits": {
      "empathy": number_0_to_1,
      "self_efficacy": number_0_to_1,
      "impulse_control": number_0_to_1,
      "cognitive_flexibility": number_0_to_1,
      "emotional_regulation": number_0_to_1
    }
  },
  "emotional_triggers": {
    "positive_triggers": [
      {
        "keywords": ["achievement", "recognition"],
        "emotion_type": "pride",
        "intensity_multiplier": 1.2,
        "description": "Feels validated when work is recognized"
      }
    ],
    "negative_triggers": [
      {
        "keywords": ["dismissive", "ignored"],
        "emotion_type": "frustration",
        "intensity_multiplier": 1.1,
        "description": "Gets frustrated when ideas are dismissed"
      }
    ]
  }
}

EXAMPLES OF DISTINCTIVE PATTERNS (don't copy exactly but use as reference):
- Tech founder: openness 0.85, conscientiousness 0.75, extraversion 0.65
- Teacher: agreeableness 0.8, care_harm 0.9, authority_subversion 0.3
- Artist: openness 0.9, traditional_vs_secular 0.2, uncertainty_avoidance 0.25
- Engineer: conscientiousness 0.8, power_distance 0.3, risk_sensitivity 0.7

DISTINCTIVENESS REQUIREMENTS:
- Create distinctive trait patterns that reflect their background and personality
- Avoid clustering around 0.5 defaults - give them clear personality signature
- Traits should be internally consistent and tell a coherent story
- Emotional triggers should be specific to their background and experiences
- Make the cognitive profile memorable and authentic to who they are`
    },
    {
      role: "user",
      content: `Generate cognitive profile for: ${basePersona.name} (${basePersona.identity.occupation}, age ${basePersona.identity.age}), based on: ${prompt}

IMPORTANT: Create distinctive trait values that avoid 0.5 defaults. Make this person psychologically unique.`
    }
  ];

  console.log('📤 DEBUG: Sending cognitive prompt to OpenAI:', {
    model: 'gpt-5-2025-08-07',
    messageCount: messages.length,
    systemPromptLength: messages[0].content.length,
    userPromptLength: messages[1].content.length
  });

  const response = await generateChatResponse(messages, openAIApiKey, {
    model: 'gpt-5-2025-08-07',
    max_completion_tokens: 2000
  });

  const content = response.choices[0].message.content;
  console.log('📥 DEBUG: Raw OpenAI response:', {
    responseLength: content.length,
    responsePreview: content.substring(0, 500),
    containsJson: content.includes('{') && content.includes('}')
  });
  
  try {
    const parsed = JSON.parse(content);
    
    // Validate that we don't have all default values
    const bigFive = parsed.cognitive_profile?.big_five;
    if (bigFive) {
      const allNearDefault = Object.values(bigFive).every((value: any) => 
        typeof value === 'number' && Math.abs(value - 0.5) < 0.1
      );
      
      if (allNearDefault) {
        console.warn('⚠️ WARNING: All Big Five traits are near 0.5 defaults, retrying...');
        throw new Error('Generated default values, retry needed');
      }
      
      console.log('✅ V3 cognitive profile generated with distinctive traits:', {
        openness: bigFive.openness,
        conscientiousness: bigFive.conscientiousness,
        extraversion: bigFive.extraversion,
        agreeableness: bigFive.agreeableness,
        neuroticism: bigFive.neuroticism
      });
    }
    
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse V3 cognitive profile JSON:', {
      error: error.message,
      rawResponse: content
    });
    throw new Error('Invalid JSON response from OpenAI for V3 cognitive profile');
  }
}

// Generate V3 Life Context
async function generateV3LifeContext(basePersona: any, prompt: string): Promise<any> {
  console.log('🏠 Generating V3 life context...');
  
  const messages = [
    {
      role: "system",
      content: `Generate compelling life context that makes this persona distinctive and memorable. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "life_context": {
    "supports": [
      "Specific support system #1",
      "Specific support system #2",
      "Specific support system #3"
    ],
    "stressors": [
      "Specific stressor #1",
      "Specific stressor #2", 
      "Specific stressor #3"
    ],
    "daily_routine": "Detailed description of their typical day",
    "current_situation": "Current life situation with tensions/developments",
    "background_narrative": "How they became who they are",
    "lifestyle": "Values and preferences reflected in how they live"
  }
}

Make them feel like a real person with a compelling story based on their background.`
    },
    {
      role: "user",
      content: `Generate life context for: ${basePersona.name} (${basePersona.identity.occupation}, ${basePersona.identity.age}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, openAIApiKey, {
    model: 'gpt-5-2025-08-07',
    max_completion_tokens: 1500
  });

  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse V3 life context JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 life context');
  }
}

// Generate V3 Knowledge Profile
async function generateV3KnowledgeProfile(basePersona: any, prompt: string): Promise<any> {
  console.log('📚 Generating V3 knowledge profile...');
  
  const messages = [
    {
      role: "system",
      content: `Generate a distinctive knowledge profile. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "knowledge_profile": {
    "general_knowledge_level": "high",
    "tech_literacy": "high",
    "domains_of_expertise": [
      "Specific expertise area #1",
      "Specific expertise area #2"
    ],
    "knowledge_domains": {
      "arts": 4,
      "health": 3,
      "sports": 2,
      "finance": 3,
      "history": 4,
      "science": 3,
      "business": 4,
      "politics": 3,
      "technology": 5,
      "entertainment": 4
    }
  }
}

Give them 2-3 areas of expertise (4-5) and 2-3 areas of low knowledge (1-2).`
    },
    {
      role: "user",
      content: `Generate knowledge profile for: ${basePersona.name} based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, openAIApiKey, {
    model: 'gpt-5-2025-08-07',
    max_completion_tokens: 1200
  });

  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse V3 knowledge profile JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 knowledge profile');
  }
}

// Generate Interview Sections
async function generateInterviewSections(basePersona: any): Promise<any[]> {
  console.log('🎤 Generating interview sections...');
  
  const messages = [
    {
      role: "system",
      content: `Generate interview responses for this persona. Return ONLY valid JSON array.

REQUIRED STRUCTURE:
[
  {
    "section_title": "Personal Background",
    "responses": [
      {
        "question": "Tell me about yourself",
        "answer": "Authentic response in their voice"
      },
      {
        "question": "What's your background?", 
        "answer": "Detailed background response"
      }
    ]
  },
  {
    "section_title": "Work and Career",
    "responses": [
      {
        "question": "What do you do for work?",
        "answer": "Detailed work response"
      }
    ]
  }
]

Create 3-4 sections with 2-3 responses each. Make them sound authentic to the persona.`
    },
    {
      role: "user",
      content: `Generate interview for: ${basePersona.name} (${basePersona.identity.occupation})`
    }
  ];

  try {
    const response = await generateChatResponse(messages, openAIApiKey, {
      model: 'gpt-5-2025-08-07',
      max_completion_tokens: 2000
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️ Interview generation failed, using fallback');
    return [
      {
        section_title: "Personal Background",
        responses: [
          {
            question: "Tell me about yourself",
            answer: `Hi, I'm ${basePersona.name}. I'm a ${basePersona.identity.occupation} living in ${basePersona.identity.location.city}. I'd be happy to share more about my experiences and perspective.`
          }
        ]
      }
    ];
  }
}

serve(async (req) => {
  console.log("🚀 Enhanced Generate-persona function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log("📝 User prompt received:", prompt);

    if (!openAIApiKey) {
      console.error("❌ OpenAI API key not found");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "OpenAI API key not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("🏗️ Starting V3 persona generation...");

    // Add timeout handling for all OpenAI calls
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Generation timeout - process took too long')), 30000)
    );

    // Stage 1: Generate V3 Identity
    console.log("🔄 Stage 1: Generating identity...");
    const identity = await Promise.race([generateV3Identity(prompt), timeoutPromise]);
    
    // Stage 2: Generate V3 Cognitive Profile (all trait categories) with retry logic
    console.log("🔄 Stage 2: Generating cognitive profile...");
    let cognitiveData;
    let cognitiveAttempts = 0;
    const maxCognitiveAttempts = 3;
    
    do {
      cognitiveAttempts++;
      console.log(`🔄 Cognitive profile attempt ${cognitiveAttempts}/${maxCognitiveAttempts}`);
      
      try {
        cognitiveData = await Promise.race([generateV3CognitiveProfile(identity, prompt), timeoutPromise]);
        
        // Check for default values
        const bigFive = cognitiveData?.cognitive_profile?.big_five;
        if (bigFive) {
          const allNearDefault = Object.values(bigFive).every((value: any) => 
            typeof value === 'number' && Math.abs(value - 0.5) < 0.1
          );
          
          if (allNearDefault && cognitiveAttempts < maxCognitiveAttempts) {
            console.warn(`⚠️ Attempt ${cognitiveAttempts}: Got default values, retrying...`);
            continue;
          }
        }
        
        break;
      } catch (error) {
        console.error(`❌ Cognitive profile attempt ${cognitiveAttempts} failed:`, error.message);
        if (cognitiveAttempts >= maxCognitiveAttempts) {
          throw error;
        }
      }
    } while (cognitiveAttempts < maxCognitiveAttempts);
    
    // Stage 3: Generate V3 Life Context
    console.log("🔄 Stage 3: Generating life context...");
    const lifeContextData = await Promise.race([generateV3LifeContext(identity, prompt), timeoutPromise]);
    
    // Stage 4: Generate V3 Knowledge Profile
    console.log("🔄 Stage 4: Generating knowledge profile...");
    const knowledgeData = await Promise.race([generateV3KnowledgeProfile(identity, prompt), timeoutPromise]);
    
    // Stage 5: Generate Interview Sections
    console.log("🔄 Stage 5: Generating interview sections...");
    const interviewSections = await Promise.race([generateInterviewSections(identity), timeoutPromise]);

    // Assemble final V3 persona with proper structure - NO LEGACY FIELDS
    const finalPersona = {
      persona_id: identity.persona_id,
      name: identity.name,
      version: "3.0",
      description: generatePersonaDescription(identity, cognitiveData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Pure V3 structure matching PersonaV3 interface exactly
      persona_data: {
        version: "3.0",
        identity: identity.identity,
        life_context: lifeContextData.life_context,
        knowledge_profile: knowledgeData.knowledge_profile,
        cognitive_profile: cognitiveData.cognitive_profile,
        interview_sections: interviewSections,
        
        // Emotional triggers at ROOT level of V3 structure
        emotional_triggers: cognitiveData.emotional_triggers,
        
        // Add required V3 fields that may be missing
        memory: {
          persistence: { long_term: 0.8, short_term: 0.6 },
          long_term_events: [],
          short_term_slots: 5
        },
        state_modifiers: {
          current_state: {
            fatigue: 0.3,
            acute_stress: 0.2,
            mood_valence: 0.6,
            social_safety: 0.7,
            time_pressure: 0.3
          },
          state_to_shift_rules: []
        },
        linguistic_style: {
          base_voice: { formality: "casual", verbosity: "moderate", directness: "balanced", politeness: "medium" },
          syntax_and_rhythm: { complexity: "compound", disfluencies: ["um"], signature_phrases: [], avg_sentence_tokens: { baseline_max: 20, baseline_min: 10 }},
          anti_mode_collapse: { forbidden_frames: ["At the end of the day"], must_include_one_of: { advice: ["suggest"], opinion: ["perspective"] }},
          lexical_preferences: { hedges: ["I think"], modal_verbs: ["could"], affect_words: { negative_bias: 0.3, positive_bias: 0.6 }},
          response_shapes_by_intent: { story: ["This reminds me"], advice: ["You might consider"], opinion: ["From my perspective"] }
        },
        group_behavior: { assertiveness: "medium", interruption_tolerance: "medium", self_disclosure_rate: "medium" },
        social_cognition: { empathy: "medium", theory_of_mind: "medium", conflict_orientation: "collaborative" },
        sexuality_profile: { orientation: "heterosexual", expression: "private", flirtatiousness: "low", libido_level: "medium", relationship_norms: "monogamous" },
        runtime_controls: { style_weights: { cognition: 0.4, knowledge: 0.3, linguistics: 0.3 }, token_budgets: { max: 500, min: 100 }, variability_profile: { turn_to_turn: 0.2, session_to_session: 0.1 }}
      }
    };

    console.log("✅ V3 Persona generation completed successfully");
    console.log(`📊 Generated persona "${finalPersona.name}" with ${Object.keys(cognitiveData.cognitive_profile).length} trait categories`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      persona: finalPersona 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced generate-persona function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to generate persona description
function generatePersonaDescription(identity: any, cognitiveData: any): string {
  const name = identity.name;
  const id = identity.identity;
  const cognitive = cognitiveData.cognitive_profile;
  
  const personalityTraits: string[] = [];
  
  // Big Five analysis
  if (cognitive.big_five.extraversion > 0.7) personalityTraits.push("outgoing and energetic");
  else if (cognitive.big_five.extraversion < 0.3) personalityTraits.push("reserved and thoughtful");
  
  if (cognitive.big_five.openness > 0.7) personalityTraits.push("creative and curious");
  else if (cognitive.big_five.openness < 0.3) personalityTraits.push("practical and traditional");
  
  if (cognitive.big_five.conscientiousness > 0.7) personalityTraits.push("organized and disciplined");
  else if (cognitive.big_five.conscientiousness < 0.3) personalityTraits.push("flexible and spontaneous");
  
  // Build description
  let description = `${name} is`;
  
  if (id?.age) description += ` a ${id.age}-year-old`;
  if (id?.occupation) description += ` ${id.occupation}`;
  if (id?.location?.city) description += ` from ${id.location.city}`;
  
  description += ".";
  
  if (personalityTraits.length > 0) {
    description += ` They are ${personalityTraits.slice(0, 2).join(" and ")}.`;
  }
  
  return description;
}