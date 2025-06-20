import { generateChatResponse } from "../_shared/openai.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export async function generatePersonaDemographics(prompt: string): Promise<any> {
  console.log(`Generating demographics from prompt: "${prompt}"`);
  
  const messages = [
    {
      role: "system",
      content: `Generate a realistic persona based on the user's description. Return ONLY valid JSON with NO markdown formatting.

Required structure:
{
  "name": "First Last",
  "persona_id": "unique-id-123",
  "creation_date": "2024-01-01",
  "metadata": {
    "age": "25",
    "gender": "Non-binary",
    "race_ethnicity": "Mixed heritage",
    "education_level": "Bachelor's Degree", 
    "occupation": "Software Developer",
    "region": "Austin, Texas",
    "urban_rural_context": "Urban",
    "language_proficiency": ["English", "Spanish"],
    "political_affiliation": "Progressive",
    "income_level": "$60,000-$80,000",
    "marital_status": "Single",
    "physical_health_status": "Good",
    "tech_familiarity": "Expert"
  }
}

Fill ALL metadata fields with realistic values. Use diverse, non-stereotypical demographics.`
    },
    {
      role: "user",
      content: prompt
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  console.log('Raw OpenAI response length:', content.length);
  console.log('Raw OpenAI response preview:', content.substring(0, 200));
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse demographics JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for demographics');
  }
}

export async function generatePersonaTraits(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating traits for persona: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system", 
      content: `Generate realistic psychological traits for the persona. Return ONLY valid JSON with trait values between 0.0-1.0.

CRITICAL: Avoid default values of exactly 0.5. Use varied, realistic values that create a unique personality.

Return this EXACT structure:
{
  "trait_profile": {
    "big_five": {
      "openness": 0.73,
      "conscientiousness": 0.82,
      "extraversion": 0.45,
      "agreeableness": 0.67,
      "neuroticism": 0.28
    },
    "moral_foundations": {
      "care_harm": 0.78,
      "fairness_cheating": 0.85,
      "loyalty_betrayal": 0.63,
      "authority_subversion": 0.42,
      "sanctity_degradation": 0.38,
      "liberty_oppression": 0.72
    },
    "world_values": {
      "traditional_vs_secular": 0.34,
      "survival_vs_self_expression": 0.76,
      "materialist_vs_postmaterialist": 0.58
    },
    "political_compass": {
      "economic_left_right": 0.45,
      "social_authoritarian_libertarian": 0.68,
      "political_salience": 0.52,
      "group_fusion_level": 0.39,
      "outgroup_threat_sensitivity": 0.31
    }
  },
  "emotional_triggers": {
    "positive_triggers": ["Recognition", "Learning new skills"],
    "negative_triggers": ["Micromanagement", "Dishonesty"]
  }
}`
    },
    {
      role: "user",
      content: `Generate traits for: ${basePersona.name}\nContext: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse traits JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for traits');
  }
}

export async function generateInterviewResponses(basePersona: any): Promise<any[]> {
  console.log(`Generating interview responses for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate interview responses for the persona. Return ONLY valid JSON array with this structure:

[
  {
    "section_title": "Personal Background",
    "responses": [
      {
        "question": "Tell me about yourself",
        "answer": "I'm a software developer based in Austin..."
      }
    ]
  }
]

Generate 3-4 sections covering background, values, daily life, and future goals.`
    },
    {
      role: "user", 
      content: `Generate interview for: ${basePersona.name}, ${basePersona.metadata?.occupation || 'Professional'}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse interview JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for interview');
  }
}
