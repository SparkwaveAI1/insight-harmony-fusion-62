
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
      content: `Generate comprehensive demographic data for a realistic persona. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE - Include ALL core demographic fields:
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
    "relationship_history": "Previous relationship",
    "military_service": "None",
    "region": "Austin, Texas",
    "urban_rural_context": "Urban",
    "location_history": {
      "grew_up_in": "Dallas, TX",
      "current_residence": "Austin, TX", 
      "places_lived": ["Dallas", "Austin"]
    },
    "migration_history": "Moved for job opportunities",
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
    "aesthetic_subculture": "Minimalist"
  }
}

Generate realistic, diverse values for ALL fields. Avoid stereotypes and defaults.`
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

export async function generatePersonaHealthAndPhysical(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating health and physical attributes for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate comprehensive health and physical attributes for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
  "health_attributes": {
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
    "disability_accommodations": "None needed"
  },
  "physical_description": {
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
}`
    },
    {
      role: "user",
      content: `Generate health and physical attributes for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse health/physical JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for health/physical attributes');
  }
}

export async function generatePersonaRelationshipsAndFamily(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating relationships and family data for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate comprehensive relationships and family data for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
  "relationships_family": {
    "has_children": false,
    "number_of_children": 0,
    "children_ages": [],
    "stepchildren": false,
    "custody_arrangement": "N/A",
    "living_situation": "Lives alone",
    "household_composition": ["Self"],
    "primary_caregiver_responsibilities": "None",
    "eldercare_responsibilities": "None",
    "partner_spouse_relationship": "Single",
    "partner_health_status": "N/A",
    "children_health_issues": "N/A",
    "family_relationship_quality": "Good",
    "family_stressors": [],
    "support_system_strength": "Strong",
    "extended_family_involvement": "Moderate",
    "relationship_priorities": "Career focused",
    "co_parenting_dynamics": "N/A",
    "family_financial_responsibilities": "Self only",
    "family_medical_history_impact": "None"
  }
}`
    },
    {
      role: "user",
      content: `Generate relationships and family data for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse relationships/family JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for relationships/family');
  }
}

export async function generatePersonaKnowledgeDomains(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating knowledge domains for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate knowledge domain ratings (1-5) for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
  "knowledge_domains": {
    "finance_basics": 3,
    "crypto_blockchain": 2,
    "world_politics": 3,
    "national_politics": 4,
    "pop_culture": 4,
    "basic_technology": 5,
    "deep_technology": 5,
    "health_medicine": 3,
    "advanced_medical": 1,
    "science_concepts": 4,
    "sports": 2,
    "news_literacy": 4,
    "environmental_issues": 4,
    "cultural_history": 3,
    "law_legal": 2,
    "religion_spirituality": 2,
    "art_literature": 3,
    "gaming": 4,
    "food_cooking": 3,
    "travel_geography": 3,
    "parenting_childcare": 1,
    "home_improvement": 2,
    "business_entrepreneurship": 3,
    "psychology_social_science": 3,
    "economics": 3
  }
}

Rate each domain 1-5 based on the persona's background and interests.`
    },
    {
      role: "user",
      content: `Generate knowledge domains for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse knowledge domains JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for knowledge domains');
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
