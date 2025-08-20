// OpenAI service functions for generating PersonaV2 sections

import { PersonaV2Identity, PersonaV2LifeContext, PersonaV2CognitiveProfile, PersonaV2SocialCognition, PersonaV2HealthProfile, PersonaV2SexualityProfile, PersonaV2KnowledgeProfile, PersonaV2EmotionalTriggers } from "./personaV2Types.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function callOpenAI(messages: any[], temperature = 0.8, maxTokens = 1500): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Clean up markdown formatting if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Failed to parse JSON response:', content);
    throw new Error(`Invalid JSON response from OpenAI: ${content.substring(0, 100)}...`);
  }
}

export async function generatePersonaV2Identity(prompt: string): Promise<PersonaV2Identity> {
  const messages = [
    {
      role: "system",
      content: `Generate a realistic persona identity based on the user prompt. Create a complete identity section for PersonaV2 format.
      
      Return JSON in this exact structure:
      {
        "name": "string",
        "age": number (18-80),
        "gender": "string",
        "pronouns": "string",
        "ethnicity": "string", 
        "nationality": "string",
        "location": {
          "city": "string",
          "region": "string", 
          "country": "string"
        },
        "occupation": "string",
        "relationship_status": "single|dating|committed|married|separated|divorced|widowed",
        "dependents": number (0-5)
      }
      
      Make this persona unique, realistic, and interesting. Avoid stereotypes.`
    },
    {
      role: "user",
      content: prompt
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2LifeContext(identity: PersonaV2Identity, prompt: string): Promise<PersonaV2LifeContext> {
  const messages = [
    {
      role: "system",
      content: `Generate a detailed life context for this persona. Use their identity to create a coherent background.
      
      Return JSON in this exact structure:
      {
        "background_narrative": "string (200-400 words detailed background story)",
        "current_situation": "string (100-200 words current circumstances)",
        "daily_routine": "string (100-200 words typical day)",
        "stressors": ["string", "string", "string"] (3-5 items),
        "supports": ["string", "string", "string"] (3-5 items),
        "life_stage": "emerging_adult|early_career|midlife|late_career|retired"
      }
      
      Make this realistic and specific to their age, occupation, and location.`
    },
    {
      role: "user", 
      content: `Create life context for: ${identity.name}, age ${identity.age}, ${identity.occupation} in ${identity.location.city}, ${identity.location.country}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2CognitiveProfile(identity: PersonaV2Identity, lifeContext: PersonaV2LifeContext, prompt: string): Promise<PersonaV2CognitiveProfile> {
  const messages = [
    {
      role: "system",
      content: `Generate a cognitive profile with realistic Big Five traits and moral foundations. Avoid default 0.5 values.
      
      Return JSON in this exact structure:
      {
        "big_five": {
          "openness": number (0.0-1.0),
          "conscientiousness": number (0.0-1.0), 
          "extraversion": number (0.0-1.0),
          "agreeableness": number (0.0-1.0),
          "neuroticism": number (0.0-1.0)
        },
        "intelligence": {
          "level": "low|average|high|gifted",
          "type": ["analytical", "creative", "practical", "emotional"] (1-3 items)
        },
        "decision_style": "logical|emotional|impulsive|risk-averse|risk-seeking|procedural",
        "moral_foundations": {
          "care_harm": number (0.0-1.0),
          "fairness_cheating": number (0.0-1.0),
          "loyalty_betrayal": number (0.0-1.0),
          "authority_subversion": number (0.0-1.0),
          "sanctity_degradation": number (0.0-1.0),
          "liberty_oppression": number (0.0-1.0)
        },
        "temporal_orientation": "past|present|future|balanced",
        "worldview_summary": "string (100-200 words describing their worldview)"
      }
      
      Make traits realistic and avoid too many 0.5 values. Base on their background and occupation.`
    },
    {
      role: "user",
      content: `Create cognitive profile for: ${identity.name}, a ${identity.age}-year-old ${identity.occupation}. Background: ${lifeContext.background_narrative.substring(0, 200)}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2SocialCognition(identity: PersonaV2Identity, cognitiveProfile: PersonaV2CognitiveProfile, prompt: string): Promise<PersonaV2SocialCognition> {
  const messages = [
    {
      role: "system",
      content: `Generate social cognition traits that align with their Big Five personality and background.
      
      Return JSON in this exact structure:
      {
        "empathy": "low|medium|high",
        "theory_of_mind": "low|medium|high",
        "trust_baseline": "low|medium|high", 
        "conflict_orientation": "avoidant|collaborative|confrontational|competitive",
        "persuasion_style": "story-led|evidence-led|authority-led|reciprocity-led|status-led",
        "attachment_style": "secure|anxious|avoidant|disorganized",
        "ingroup_outgroup_sensitivity": "low|medium|high"
      }
      
      Base this on their agreeableness, neuroticism, and extraversion levels.`
    },
    {
      role: "user",
      content: `Create social cognition for: ${identity.name}. Big Five: O${cognitiveProfile.big_five.openness}, C${cognitiveProfile.big_five.conscientiousness}, E${cognitiveProfile.big_five.extraversion}, A${cognitiveProfile.big_five.agreeableness}, N${cognitiveProfile.big_five.neuroticism}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2HealthProfile(identity: PersonaV2Identity, lifeContext: PersonaV2LifeContext, prompt: string): Promise<PersonaV2HealthProfile> {
  const messages = [
    {
      role: "system",
      content: `Generate a realistic health profile based on age, lifestyle, and stressors.
      
      Return JSON in this exact structure:
      {
        "mental_health": ["none"|"anxiety"|"depression"|"adhd"|"ptsd"|"bipolar"|"other"] (1-3 items),
        "physical_health": ["healthy"|"chronic_illness"|"disabled"] (1-2 items),
        "substance_use": ["none"|"alcohol"|"tobacco"|"cannabis"|"stimulants"|"opioids"|"other"] (1-3 items),
        "energy_baseline": "low|medium|high",
        "circadian_rhythm": "morning|evening|irregular"
      }
      
      Make this realistic for their age and stress levels. Most people have at least some health considerations.`
    },
    {
      role: "user",
      content: `Create health profile for: ${identity.name}, age ${identity.age}. Stressors: ${lifeContext.stressors.join(', ')}. Life stage: ${lifeContext.life_stage}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2SexualityProfile(identity: PersonaV2Identity, cognitiveProfile: PersonaV2CognitiveProfile, prompt: string): Promise<PersonaV2SexualityProfile> {
  const messages = [
    {
      role: "system",
      content: `Generate a sexuality profile that's appropriate and realistic.
      
      Return JSON in this exact structure:
      {
        "orientation": "heterosexual|homosexual|bisexual|pansexual|asexual|questioning|other",
        "privacy_preference": "private|selective|public"
      }
      
      Base privacy preference on their openness and cultural background.`
    },
    {
      role: "user",
      content: `Create sexuality profile for: ${identity.name}. Openness: ${cognitiveProfile.big_five.openness}, Culture: ${identity.nationality}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2KnowledgeProfile(identity: PersonaV2Identity, lifeContext: PersonaV2LifeContext, prompt: string): Promise<PersonaV2KnowledgeProfile> {
  const messages = [
    {
      role: "system",
      content: `Generate knowledge domains based on their occupation, education, and interests.
      
      Return JSON in this exact structure:
      {
        "domains_of_expertise": ["string", "string"] (2-4 relevant domains),
        "general_knowledge_level": "low|average|high",
        "tech_literacy": "low|medium|high"
      }
      
      Base this on their occupation and background. Include both professional and personal interests.`
    },
    {
      role: "user",
      content: `Create knowledge profile for: ${identity.name}, ${identity.occupation}. Background: ${lifeContext.background_narrative.substring(0, 150)}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2EmotionalTriggers(identity: PersonaV2Identity, cognitiveProfile: PersonaV2CognitiveProfile, healthProfile: PersonaV2HealthProfile, prompt: string): Promise<PersonaV2EmotionalTriggers> {
  const messages = [
    {
      role: "system",
      content: `Generate emotional triggers based on their personality and mental health.
      
      Return JSON in this exact structure:
      {
        "positive": ["string", "string", "string"] (3-5 things that make them happy),
        "negative": ["string", "string", "string"] (3-5 things that upset/stress them)
      }
      
      Base this on their neuroticism level, mental health status, and personality traits.`
    },
    {
      role: "user",
      content: `Create emotional triggers for: ${identity.name}. Neuroticism: ${cognitiveProfile.big_five.neuroticism}, Mental health: ${healthProfile.mental_health.join(', ')}. Original prompt: ${prompt}`
    }
  ];

  return await callOpenAI(messages);
}

export async function generatePersonaV2Description(identity: PersonaV2Identity, cognitiveProfile: PersonaV2CognitiveProfile, lifeContext: PersonaV2LifeContext): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `Generate a 2-3 sentence concise description of this persona that captures their essence.
      
      Return JSON in this exact structure:
      {
        "description": "string (2-3 sentences describing the persona)"
      }`
    },
    {
      role: "user",
      content: `Describe: ${identity.name}, age ${identity.age}, ${identity.occupation}. Big Five: O${cognitiveProfile.big_five.openness}, C${cognitiveProfile.big_five.conscientiousness}, E${cognitiveProfile.big_five.extraversion}, A${cognitiveProfile.big_five.agreeableness}, N${cognitiveProfile.big_five.neuroticism}. Current: ${lifeContext.current_situation.substring(0, 100)}`
    }
  ];

  const result = await callOpenAI(messages, 0.7, 200);
  return result.description || `${identity.name} is a ${identity.age}-year-old ${identity.occupation} based in ${identity.location.city}.`;
}