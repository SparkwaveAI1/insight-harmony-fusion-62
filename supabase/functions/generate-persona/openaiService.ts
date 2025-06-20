
import { PersonaTemplate } from "./types.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

// Centralized JSON parsing with consistent error handling
function parseOpenAIResponse(content: string, stepName: string): any {
  try {
    // Clean the response of markdown formatting
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanedContent);
    console.log(`${stepName}: Successfully parsed JSON response`);
    return parsed;
  } catch (error) {
    console.error(`${stepName}: JSON parsing failed`, error);
    console.error(`${stepName}: Raw content:`, content);
    throw new Error(`Failed to parse ${stepName} response: ${error.message}`);
  }
}

// STEP 1: Generate basic demographics and persona info
export async function generatePersonaDemographics(userPrompt: string): Promise<PersonaTemplate> {
  console.log(`Generating demographics from prompt: ${userPrompt}`);
  
  const prompt = `You are an expert persona creator. Generate basic demographics and metadata for a persona based on this description: "${userPrompt}"

CRITICAL INSTRUCTIONS:
1. You must respond with ONLY valid JSON - no markdown, no explanations, no extra text
2. Focus ONLY on demographics, basic info, and metadata - NO trait profiles yet
3. Make the persona feel like a real person with authentic details

Generate a persona with these fields ONLY:
{
  "persona_id": "unique_id",
  "name": "Full Name",
  "creation_date": "2025-06-20",
  "metadata": {
    "enhanced_metadata_version": 2,
    "age": 30,
    "gender": "male/female/other",
    "location": "City, State/Country",
    "occupation": "Job Title",
    "education_level": "Education Level",
    "marital_status": "Status",
    "children": 0,
    "income_bracket": "income level",
    "housing": "housing situation",
    "health": {
      "physical_activity_level": 0.7,
      "chronic_conditions": [],
      "mental_health_status": "good",
      "sleep_quality": 0.8
    },
    "background": "Brief background story",
    "personality_summary": "Brief personality overview"
  }
}

Return ONLY the JSON object:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error in demographics: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const persona = parseOpenAIResponse(content, 'Demographics Generation');
    console.log(`Generated demographics for: ${persona.name}`);
    return persona;
    
  } catch (error) {
    console.error('Error generating demographics:', error);
    throw new Error(`Demographics generation failed: ${error.message}`);
  }
}

// STEP 2: Generate comprehensive trait profile, behavioral modulation, and linguistic profile
export async function generatePersonaTraits(basePersona: PersonaTemplate, userPrompt: string): Promise<any> {
  console.log(`Generating comprehensive trait and behavioral profile for: ${basePersona.name}`);
  
  const prompt = `You are generating a comprehensive psychological and behavioral profile for this persona:

Name: ${basePersona.name}
Age: ${basePersona.metadata.age}
Occupation: ${basePersona.metadata.occupation}
Background: ${basePersona.metadata.background}

Original prompt: "${userPrompt}"

CRITICAL INSTRUCTIONS:
1. You MUST create REALISTIC, VARIED trait values - DO NOT use 0.5 as default
2. Base ALL trait values on the persona's background, age, occupation, and personality
3. Create meaningful variation - avoid clustering around 0.5
4. Make traits internally consistent and realistic for this specific person
5. Respond with ONLY valid JSON containing ALL categories below

TRAIT VALUE GUIDELINES:
- Values must be between 0.0 and 1.0
- Avoid using 0.5 unless it genuinely represents a balanced middle ground
- Create realistic psychological profiles with meaningful variation
- Consider how age, background, and occupation would shape personality

{
  "trait_profile": {
    "big_five": {
      "openness": [realistic value based on background - avoid 0.5],
      "conscientiousness": [realistic value based on occupation/background],
      "extraversion": [realistic value based on personality description],
      "agreeableness": [realistic value based on background/values],
      "neuroticism": [realistic value based on life circumstances]
    },
    "moral_foundations": {
      "care": [realistic value based on personality/background],
      "fairness": [realistic value based on values/occupation],
      "loyalty": [realistic value based on background/relationships],
      "authority": [realistic value based on background/age],
      "sanctity": [realistic value based on background/values],
      "liberty": [realistic value based on personality/political views]
    },
    "world_values": {
      "traditional_vs_secular": [realistic value based on age/background/location],
      "survival_vs_self_expression": [realistic value based on income/education],
      "materialist_vs_postmaterialist": [realistic value based on background/values]
    },
    "political_compass": {
      "economic": [realistic value based on occupation/background],
      "authoritarian_libertarian": [realistic value based on personality/values],
      "cultural_conservative_progressive": [realistic value based on age/location/background],
      "political_salience": [realistic value - how much they care about politics],
      "group_fusion_level": [realistic value based on personality],
      "outgroup_threat_sensitivity": [realistic value based on background],
      "commons_orientation": [realistic value based on values],
      "political_motivations": {
        "material_interest": [realistic value based on income/occupation],
        "moral_vision": [realistic value based on personality],
        "cultural_preservation": [realistic value based on age/background],
        "status_reordering": [realistic value based on background/values]
      }
    },
    "cultural_dimensions": {
      "power_distance": [realistic value based on background/occupation],
      "individualism_vs_collectivism": [realistic value based on culture/background],
      "masculinity_vs_femininity": [realistic value based on personality/background],
      "uncertainty_avoidance": [realistic value based on personality],
      "long_term_orientation": [realistic value based on age/background],
      "indulgence_vs_restraint": [realistic value based on personality/culture]
    },
    "social_identity": {
      "identity_strength": [realistic value based on personality/background],
      "identity_complexity": [realistic value based on education/experiences],
      "ingroup_bias_tendency": [realistic value based on background],
      "outgroup_bias_tendency": [realistic value based on background/experiences],
      "social_dominance_orientation": [realistic value based on personality/occupation],
      "system_justification": [realistic value based on background/success],
      "intergroup_contact_comfort": [realistic value based on background/location],
      "cultural_intelligence": [realistic value based on experiences/education]
    },
    "behavioral_economics": {
      "present_bias": [realistic value based on age/personality],
      "loss_aversion": [realistic value based on experiences/background],
      "overconfidence": [realistic value based on personality/success],
      "risk_sensitivity": [realistic value based on occupation/background],
      "scarcity_sensitivity": [realistic value based on income/background]
    },
    "extended_traits": {
      "truth_orientation": [realistic value based on personality/occupation],
      "moral_consistency": [realistic value based on personality/values],
      "self_awareness": [realistic value based on education/experiences],
      "empathy": [realistic value based on personality/background],
      "self_efficacy": [realistic value based on success/experiences],
      "manipulativeness": [realistic value based on personality/occupation],
      "impulse_control": [realistic value based on personality/background],
      "shadow_trait_activation": [realistic value based on stress/personality],
      "attention_pattern": [realistic value based on occupation/personality],
      "cognitive_load_resilience": [realistic value based on education/experience],
      "institutional_trust": [realistic value based on background/experiences],
      "conformity_tendency": [realistic value based on personality/background],
      "conflict_avoidance": [realistic value based on personality],
      "cognitive_flexibility": [realistic value based on education/experiences],
      "need_for_cognitive_closure": [realistic value based on personality],
      "emotional_intensity": [realistic value based on personality],
      "emotional_regulation": [realistic value based on age/experiences],
      "trigger_sensitivity": [realistic value based on background/experiences]
    }
  },
  "behavioral_modulation": {
    "communication_style": {
      "formality_level": [realistic value based on occupation/background],
      "emotional_expressiveness": [realistic value based on personality],
      "directness": [realistic value based on personality/culture],
      "humor_usage": [realistic value based on personality]
    },
    "response_patterns": {
      "elaboration_tendency": [realistic value based on education/personality],
      "example_usage": [realistic value based on communication style],
      "personal_anecdote_frequency": [realistic value based on personality],
      "technical_depth_preference": [realistic value based on education/occupation]
    },
    "contextual_adaptability": {
      "topic_sensitivity": [realistic value based on personality/background],
      "audience_awareness": [realistic value based on social skills],
      "emotional_responsiveness": [realistic value based on empathy/personality]
    }
  },
  "linguistic_profile": {
    "vocabulary_complexity": [realistic value based on education],
    "sentence_structure_preference": [realistic value based on education/communication style],
    "cultural_linguistic_markers": [array of relevant cultural/regional markers],
    "communication_pace": [realistic value based on personality],
    "filler_word_usage": [realistic value based on communication style],
    "interruption_tendency": [realistic value based on personality/culture],
    "question_asking_frequency": [realistic value based on curiosity/personality],
    "storytelling_inclination": [realistic value based on personality/culture]
  },
  "emotional_triggers": {
    "positive_triggers": [
      {
        "keywords": [relevant positive trigger words based on background/values],
        "emotion_type": "appropriate positive emotion",
        "intensity_multiplier": [realistic 1-10 value],
        "description": "realistic description of what energizes them"
      }
    ],
    "negative_triggers": [
      {
        "keywords": [relevant negative trigger words based on background/fears],
        "emotion_type": "appropriate negative emotion",
        "intensity_multiplier": [realistic 1-10 value],
        "description": "realistic description of what frustrates/angers them"
      }
    ]
  },
  "simulation_directives": {
    "authenticity_level": [realistic value around 0.8-0.9],
    "consistency_enforcement": [realistic value around 0.7-0.9],
    "emotional_range_limit": [realistic value based on personality],
    "response_variability": [realistic value based on personality],
    "knowledge_boundary_respect": [realistic value around 0.8-0.9],
    "personality_drift_prevention": [realistic value around 0.7-0.9]
  },
  "preinterview_tags": [
    "demographic_match",
    "trait_validated", 
    "behavioral_profiled",
    "realistic_variation"
  ]
}

REMEMBER: Create a psychologically realistic person with meaningful trait variation. Avoid default 0.5 values unless genuinely appropriate.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8, // Increased temperature for more variation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error in trait generation: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const fullProfile = parseOpenAIResponse(content, 'Trait Profile Generation');
    console.log(`Generated comprehensive profile with ${Object.keys(fullProfile).length} sections`);
    
    // Log some sample trait values to verify they're not all defaults
    if (fullProfile.trait_profile?.big_five) {
      console.log('Generated Big Five sample:', {
        openness: fullProfile.trait_profile.big_five.openness,
        conscientiousness: fullProfile.trait_profile.big_five.conscientiousness,
        extraversion: fullProfile.trait_profile.big_five.extraversion
      });
    }
    
    return fullProfile;
    
  } catch (error) {
    console.error('Error generating comprehensive profile:', error);
    throw new Error(`Trait profile generation failed: ${error.message}`);
  }
}

// STEP 3: Generate interview responses
export async function generateInterviewResponses(persona: PersonaTemplate): Promise<any> {
  console.log(`Generating interview responses for: ${persona.name}`);
  
  const prompt = `Generate authentic interview responses for this persona:

Name: ${persona.name}
Age: ${persona.metadata.age}
Occupation: ${persona.metadata.occupation}
Background: ${persona.metadata.background}
Key traits: Openness ${persona.trait_profile?.big_five?.openness}, Conscientiousness ${persona.trait_profile?.big_five?.conscientiousness}

CRITICAL: Respond with ONLY valid JSON in this exact format:
[
  {
    "section_title": "Personal Background",
    "responses": [
      {
        "question": "Tell me about yourself",
        "answer": "Authentic response in the persona's voice..."
      }
    ]
  }
]

Create 8-10 interview sections covering: background, daily life, decision making, values, relationships, career, challenges, future outlook, and personal insights. Make responses feel natural and authentic to this specific persona.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error for interview: ${response.status} ${response.statusText}`);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const interviewSections = parseOpenAIResponse(content, 'Interview Generation');
    console.log(`Generated ${interviewSections.length} interview sections`);
    return interviewSections;
    
  } catch (error) {
    console.error('Error generating interview responses:', error);
    throw new Error(`Interview generation failed: ${error.message}`);
  }
}
