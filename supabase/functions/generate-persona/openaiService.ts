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
      content: `You are an expert in creating realistic personas with comprehensive demographic profiles. Generate detailed demographics for a persona based on the user's prompt.

CRITICAL: Return ONLY valid JSON with this EXACT flat structure - no markdown, no explanations:

{
  "name": "First Last",
  "persona_id": "unique-id-123",
  "creation_date": "2024-01-01",
  "metadata": {
    "age": "25",
    "gender": "Non-binary", 
    "race_ethnicity": "Mixed heritage",
    "sexual_orientation": "Pansexual",
    "education_level": "Bachelor's Degree",
    "occupation": "Software Developer",
    "employment_type": "Full-time",
    "income_level": "$60,000-$80,000",
    "social_class_identity": "Middle class",
    "marital_status": "Single",
    "parenting_role": "No children",
    "relationship_history": "Previous long-term relationship",
    "military_service": "None",
    "region": "Austin, Texas",
    "urban_rural_context": "Urban",
    "migration_history": "Moved from Dallas",
    "climate_risk_zone": "Moderate heat risk",
    "language_proficiency": ["English", "Spanish"],
    "religious_affiliation": "Agnostic",
    "religious_practice_level": "Non-practicing",
    "cultural_background": "Mexican-American",
    "cultural_affiliation": ["Hispanic", "Tech culture"],
    "political_affiliation": "Progressive",
    "political_sophistication": "Moderate",
    "tech_familiarity": "Expert",
    "learning_modality": "Visual learner",
    "trust_in_institutions": "Moderate skepticism",
    "trauma_exposure": "None reported",
    "financial_pressure": "Low",
    "credit_access": "Good credit",
    "debt_load": "Student loans only",
    "time_abundance": "Moderate availability",
    "media_ecosystem": ["Reddit", "Twitter", "Tech blogs"],
    "aesthetic_subculture": "Minimalist",
    "physical_health_status": "Good",
    "mental_health_status": "Stable",
    "health_prioritization": "High",
    "healthcare_access": "Employer insurance",
    "chronic_conditions": [],
    "medications": [],
    "mental_health_history": "Therapy for anxiety",
    "therapy_counseling_experience": "Yes, positive",
    "health_insurance_status": "Insured",
    "fitness_activity_level": "Moderately active",
    "dietary_restrictions": ["Vegetarian"],
    "sleep_patterns": "Night owl",
    "stress_management": "Exercise and meditation",
    "substance_use": "Occasional alcohol",
    "health_family_history": "No major issues",
    "disability_accommodations": "None needed",
    "height": "5'7\"",
    "build_body_type": "Average build",
    "hair_color": "Dark brown",
    "hair_style": "Short and styled",
    "eye_color": "Brown",
    "skin_tone": "Medium",
    "distinctive_features": ["Glasses", "Small tattoo"],
    "style_fashion_sense": "Casual professional",
    "grooming_habits": "Well-maintained",
    "physical_mannerisms": ["Gestures when talking"],
    "posture_bearing": "Confident",
    "voice_speech_patterns": "Clear, measured speech"
  }
}

Generate realistic, varied demographics that avoid stereotypes. Use this flat structure and fill all relevant fields with authentic, specific details that create a distinctive persona.`
    },
    {
      role: "user",
      content: prompt
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
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
