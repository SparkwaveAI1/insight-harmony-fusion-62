
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

CRITICAL: Respond with ONLY valid JSON containing ALL categories below. Generate authentic values based on the persona's background:

{
  "trait_profile": {
    "big_five": {
      "openness": 0.7,
      "conscientiousness": 0.6,
      "extraversion": 0.8,
      "agreeableness": 0.7,
      "neuroticism": 0.4
    },
    "moral_foundations": {
      "care": 0.7,
      "fairness": 0.8,
      "loyalty": 0.6,
      "authority": 0.5,
      "sanctity": 0.4,
      "liberty": 0.7
    },
    "world_values": {
      "traditional_vs_secular": 0.6,
      "survival_vs_self_expression": 0.7,
      "materialist_vs_postmaterialist": 0.5
    },
    "political_compass": {
      "economic": 0.5,
      "authoritarian_libertarian": 0.6,
      "cultural_conservative_progressive": 0.7,
      "political_salience": 0.4,
      "group_fusion_level": 0.5,
      "outgroup_threat_sensitivity": 0.3,
      "commons_orientation": 0.7,
      "political_motivations": {
        "material_interest": 0.4,
        "moral_vision": 0.7,
        "cultural_preservation": 0.5,
        "status_reordering": 0.3
      }
    },
    "cultural_dimensions": {
      "power_distance": 0.4,
      "individualism_vs_collectivism": 0.8,
      "masculinity_vs_femininity": 0.6,
      "uncertainty_avoidance": 0.5,
      "long_term_orientation": 0.7,
      "indulgence_vs_restraint": 0.6
    },
    "social_identity": {
      "identity_strength": 0.7,
      "identity_complexity": 0.6,
      "ingroup_bias_tendency": 0.4,
      "outgroup_bias_tendency": 0.3,
      "social_dominance_orientation": 0.2,
      "system_justification": 0.5,
      "intergroup_contact_comfort": 0.8,
      "cultural_intelligence": 0.7
    },
    "behavioral_economics": {
      "present_bias": 0.4,
      "loss_aversion": 0.6,
      "overconfidence": 0.5,
      "risk_sensitivity": 0.7,
      "scarcity_sensitivity": 0.5
    },
    "extended_traits": {
      "truth_orientation": 0.8,
      "moral_consistency": 0.7,
      "self_awareness": 0.6,
      "empathy": 0.7,
      "self_efficacy": 0.6,
      "manipulativeness": 0.2,
      "impulse_control": 0.7,
      "shadow_trait_activation": 0.3,
      "attention_pattern": 0.6,
      "cognitive_load_resilience": 0.7,
      "institutional_trust": 0.5,
      "conformity_tendency": 0.4,
      "conflict_avoidance": 0.5,
      "cognitive_flexibility": 0.7,
      "need_for_cognitive_closure": 0.4,
      "emotional_intensity": 0.6,
      "emotional_regulation": 0.7,
      "trigger_sensitivity": 0.5
    }
  },
  "behavioral_modulation": {
    "communication_style": {
      "formality_level": 0.5,
      "emotional_expressiveness": 0.6,
      "directness": 0.7,
      "humor_usage": 0.4
    },
    "response_patterns": {
      "elaboration_tendency": 0.6,
      "example_usage": 0.7,
      "personal_anecdote_frequency": 0.5,
      "technical_depth_preference": 0.4
    },
    "contextual_adaptability": {
      "topic_sensitivity": 0.6,
      "audience_awareness": 0.7,
      "emotional_responsiveness": 0.6
    }
  },
  "linguistic_profile": {
    "vocabulary_complexity": 0.6,
    "sentence_structure_preference": 0.5,
    "cultural_linguistic_markers": [],
    "communication_pace": 0.6,
    "filler_word_usage": 0.3,
    "interruption_tendency": 0.4,
    "question_asking_frequency": 0.5,
    "storytelling_inclination": 0.6
  },
  "emotional_triggers": {
    "positive_triggers": [
      {
        "keywords": ["success", "achievement", "recognition"],
        "emotion_type": "pride",
        "intensity_multiplier": 7,
        "description": "Gets energized by personal accomplishments and recognition"
      }
    ],
    "negative_triggers": [
      {
        "keywords": ["unfair", "injustice", "discrimination"],
        "emotion_type": "anger",
        "intensity_multiplier": 8,
        "description": "Strongly reacts to perceived unfairness or injustice"
      }
    ]
  },
  "simulation_directives": {
    "authenticity_level": 0.9,
    "consistency_enforcement": 0.8,
    "emotional_range_limit": 0.7,
    "response_variability": 0.6,
    "knowledge_boundary_respect": 0.9,
    "personality_drift_prevention": 0.8
  },
  "preinterview_tags": [
    "demographic_match",
    "trait_validated", 
    "behavioral_profiled"
  ]
}

All trait values must be between 0.0 and 1.0. Make all values authentic and consistent with the persona's background, occupation, and personality. Generate meaningful emotional triggers based on their traits.`;

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
      const errorText = await response.text();
      console.error(`OpenAI API error in trait generation: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const fullProfile = parseOpenAIResponse(content, 'Trait Profile Generation');
    console.log(`Generated comprehensive profile with ${Object.keys(fullProfile).length} sections`);
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
