const OPENAI_API_KEY: string = Deno.env.get('OPENAI_API_KEY') || '';

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

async function generateChatResponse(messages: any[], apiKey: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

export async function generatePersonaTraitProfile(basePersona: any, prompt: string): Promise<any> {
  console.log('Generating trait profile...');
  
  const messages = [
    {
      role: "system",
      content: `Generate realistic psychological trait profile for ${basePersona.name}. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE:
{
  "trait_profile": {
    "openness": 0.75,
    "conscientiousness": 0.60,
    "extraversion": 0.45,
    "agreeableness": 0.80,
    "neuroticism": 0.30
  },
  "emotional_triggers": {
    "positive_triggers": ["achievement", "recognition", "helping others"],
    "negative_triggers": ["injustice", "dismissal", "conflict"]
  }
}

Use values 0.0-1.0. Create realistic, nuanced profiles.`
    },
    {
      role: "user",
      content: `Generate traits for ${basePersona.name}: ${basePersona.metadata?.occupation || 'person'} from ${basePersona.metadata?.location || 'unknown location'}. Original prompt: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse trait profile:', content);
    throw new Error('Invalid trait profile response from AI');
  }
}

export async function generatePersonaBehavioralLinguistic(basePersona: any, prompt: string): Promise<any> {
  console.log('Generating behavioral & linguistic profile...');
  
  const messages = [
    {
      role: "system",
      content: `Generate behavioral and linguistic profile for ${basePersona.name}. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE:
{
  "behavioral_modulation": {
    "communication_style": {
      "formality_level": 0.6,
      "emotional_expressiveness": 0.7,
      "directness": 0.5,
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
  "simulation_directives": {
    "authenticity_level": 0.9,
    "consistency_enforcement": 0.8,
    "emotional_range_limit": 0.7,
    "response_variability": 0.6,
    "knowledge_boundary_respect": 0.9,
    "personality_drift_prevention": 0.8
  },
  "preinterview_tags": ["enhanced", "behavioral_profiled"],
  "emotional_triggers": {
    "positive_triggers": ["achievement", "recognition"],
    "negative_triggers": ["criticism", "failure"]
  }
}

Use values 0.0-1.0. Create realistic profiles based on demographics.`
    },
    {
      role: "user", 
      content: `Generate behavioral profile for ${basePersona.name}: ${basePersona.metadata?.occupation || 'person'}. Original prompt: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse behavioral profile:', content);
    throw new Error('Invalid behavioral profile response from AI');
  }
}

export async function generatePersonaInterview(basePersona: any): Promise<any> {
  console.log('Generating interview responses...');
  
  const messages = [
    {
      role: "system",
      content: `Generate interview responses for ${basePersona.name}. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE:
{
  "interview_sections": [
    {
      "section_title": "Personal Background",
      "responses": [
        {
          "question": "Tell me about yourself",
          "answer": "Detailed personal response..."
        }
      ]
    },
    {
      "section_title": "Work and Career",
      "responses": [
        {
          "question": "What do you do for work?",
          "answer": "Professional response..."
        }
      ]
    }
  ]
}

Generate 3-5 sections with 2-3 questions each. Make responses authentic to the persona.`
    },
    {
      role: "user",
      content: `Generate interview for ${basePersona.name}: ${basePersona.metadata?.occupation || 'person'} from ${basePersona.metadata?.location || 'unknown location'}.`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse interview responses:', content);
    throw new Error('Invalid interview response from AI');
  }
}

export async function enhancePersonaMetadata(basePersona: any, prompt: string): Promise<any> {
  console.log('Enhancing metadata...');
  
  const messages = [
    {
      role: "system",
      content: `Enhance metadata for ${basePersona.name}. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE:
{
  "metadata": {
    "interests": ["reading", "hiking", "photography"],
    "skills": ["programming", "communication", "problem-solving"],
    "values": ["honesty", "creativity", "family"],
    "goals": ["career advancement", "personal growth"],
    "challenges": ["time management", "work-life balance"],
    "background": "Detailed background story...",
    "lifestyle": "Description of daily life and routines...",
    "personality_summary": "Brief personality overview...",
    "education": "High school diploma",
    "knowledge_domains": {
      "technology": 2,
      "finance": 1,
      "science": 3,
      "arts": 4,
      "sports": 3,
      "politics": 2,
      "history": 2,
      "health": 2,
      "business": 3,
      "entertainment": 4
    }
  }
}

CRITICAL: knowledge_domains must be realistic based on occupation, education, and background.
- Use scale 1-5 where: 1=minimal, 2=basic, 3=moderate, 4=strong, 5=expert
- Base ratings on their occupation, education level, and interests
- Most people have 1-2 domains at 4-5, several at 2-3, rest at 1-2
- Be realistic about socioeconomic factors affecting access to knowledge

Add rich, realistic details that enhance the persona without contradicting existing data.`
    },
    {
      role: "user",
      content: `Enhance metadata for ${basePersona.name}: ${basePersona.metadata?.occupation || 'person'} with ${basePersona.metadata?.education_level || 'unknown education'}. Original prompt: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse enhanced metadata:', content);
    throw new Error('Invalid metadata response from AI');
  }
}
