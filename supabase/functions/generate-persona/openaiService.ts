
import { generateChatResponse } from "../_shared/openai.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Stage 1: Core Demographics
export async function generateCoreDemographics(prompt: string): Promise<any> {
  console.log(`Generating core demographics from prompt: "${prompt}"`);
  
  const messages = [
    {
      role: "system",
      content: `Generate core demographic data for a realistic persona. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE - Include ALL these core fields:
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
    "military_service": "None"
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
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse core demographics JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for core demographics');
  }
}

// Stage 2: Location & Context
export async function generateLocationContext(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating location & context for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate location and cultural context data for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
  "location_context": {
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
    "cultural_affiliation": ["Hispanic", "Tech culture"]
  }
}`
    },
    {
      role: "user",
      content: `Generate location & context for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse location context JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for location context');
  }
}

// Stage 3: Family & Relationships
export async function generateFamilyRelationships(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating family & relationships for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate comprehensive family and relationship data for the persona. Return ONLY valid JSON.

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
      content: `Generate family & relationships for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse family relationships JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for family relationships');
  }
}

// Stage 4: Health Attributes
export async function generateHealthAttributes(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating health attributes for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate comprehensive health attributes for the persona. Return ONLY valid JSON.

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
  }
}`
    },
    {
      role: "user",
      content: `Generate health attributes for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse health attributes JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for health attributes');
  }
}

// Stage 5: Physical Description
export async function generatePhysicalDescription(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating physical description for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate comprehensive physical description for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
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
      content: `Generate physical description for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse physical description JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for physical description');
  }
}

// Stage 6: Knowledge Domains
export async function generateKnowledgeDomains(basePersona: any, prompt: string): Promise<any> {
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

// Stage 7: Psychological & Cultural
export async function generatePsychologicalCultural(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating psychological & cultural data for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate psychological and cultural data for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
  "psychological_cultural": {
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
}`
    },
    {
      role: "user",
      content: `Generate psychological & cultural data for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse psychological cultural JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for psychological cultural');
  }
}

// Stage 8: Trait Profile
export async function generateTraitProfile(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating trait profile for: ${basePersona.name}`);
  
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
    console.error('Failed to parse trait profile JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for trait profile');
  }
}

// Stage 9: Behavioral & Linguistic Profiles
export async function generateBehavioralLinguistic(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating behavioral & linguistic profiles for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate behavioral and linguistic profiles for the persona. Return ONLY valid JSON.

REQUIRED STRUCTURE:
{
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
}`
    },
    {
      role: "user",
      content: `Generate behavioral & linguistic profiles for: ${basePersona.name}, based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse behavioral linguistic JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for behavioral linguistic');
  }
}

// Stage 10: Interview Responses
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
