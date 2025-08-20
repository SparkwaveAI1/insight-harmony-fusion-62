
import { generateChatResponse } from "../_shared/openai.ts";
import { extractUserDetails, validateUserInputPreservation, generatePersonaRequirements } from "./inputProcessor.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Input Processing Utility
function extractUserDetails(prompt: string): any {
  console.log('Extracting user details from prompt:', prompt);
  
  // Extract key information patterns
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
  
  console.log('Extracted details:', JSON.stringify(extracted, null, 2));
  return extracted;
}

// Probabilistic Trait Generator
function generateProbabilisticTraits(userDetails: any, personalityContext: string): any {
  console.log('Generating probabilistic traits based on user context...');
  
  // Base probabilities adjusted by user context
  const traits = {
    power_distance: Math.random() * 0.4 + 0.2, // 0.2-0.6 range
    individualism_vs_collectivism: Math.random() * 0.6 + 0.3, // 0.3-0.9 range
    masculinity_vs_femininity: Math.random() * 0.8 + 0.1, // 0.1-0.9 range
    uncertainty_avoidance: Math.random() * 0.7 + 0.2, // 0.2-0.9 range
    long_term_orientation: Math.random() * 0.6 + 0.3, // 0.3-0.9 range
    indulgence_vs_restraint: Math.random() * 0.8 + 0.1 // 0.1-0.9 range
  };
  
  // Adjust based on occupation and context
  if (userDetails.occupation?.toLowerCase().includes('tech') || 
      userDetails.occupation?.toLowerCase().includes('software') ||
      personalityContext.toLowerCase().includes('crypto')) {
    traits.individualism_vs_collectivism += 0.1;
    traits.uncertainty_avoidance -= 0.1;
  }
  
  if (personalityContext.toLowerCase().includes('family') || 
      personalityContext.toLowerCase().includes('married')) {
    traits.individualism_vs_collectivism -= 0.1;
    traits.long_term_orientation += 0.1;
  }
  
  // Clamp values to 0-1 range
  Object.keys(traits).forEach(key => {
    traits[key] = Math.max(0, Math.min(1, traits[key]));
    traits[key] = Math.round(traits[key] * 100) / 100; // Round to 2 decimal places
  });
  
  console.log('Generated probabilistic traits:', traits);
  return traits;
}

// Stage 1: Core Demographics -> V3 Identity
export async function generateCoreDemographics(prompt: string): Promise<any> {
  console.log(`Generating V3 identity from prompt: "${prompt}"`);
  
  // Extract key details from user input first
  const userDetails = extractUserDetails(prompt);
  
  const messages = [
    {
      role: "system",
      content: `You are creating a V3 persona identity by extracting and building upon the user's provided information. 

CRITICAL INSTRUCTIONS:
1. **EXTRACT FIRST**: Identify all explicitly provided details (name, age, occupation, location, background)
2. **USE PROVIDED DATA**: Never override user-specified information with template examples
3. **FILL GAPS INTELLIGENTLY**: Only generate data for missing fields, keeping it consistent with provided context
4. **MAKE IT DISTINCTIVE**: Avoid generic values, create memorable characteristics based on the user's description

REQUIRED V3 STRUCTURE (JSON only, no markdown):
{
  "name": "[Use provided name or generate if missing]",
  "persona_id": "unique-id-123", 
  "creation_date": "2025-01-20",
  "identity": {
    "age": [Use provided age or generate 22-65],
    "gender": "[Infer from context or ask/generate]",
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
      "cultural_background": "[Extract from ethnicity/location/family]",
      "cultural_dimensions": "[Will be set separately with probabilistic values]"
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

// Add validation to the main identity generation
const response = await generateChatResponse(messages, OPENAI_API_KEY, {
  model: 'gpt-5-2025-08-07',
  max_completion_tokens: 1500
});

const content = response.choices[0].message.content;
console.log('Raw OpenAI identity response:', content);

try {
  const parsed = JSON.parse(content);
  
  // Add probabilistic cultural dimensions
  const culturalTraits = generateProbabilisticTraits(userDetails, prompt);
  parsed.identity.socioeconomic_context.cultural_dimensions = culturalTraits;
  
  console.log('Final identity with probabilistic traits:', JSON.stringify(parsed, null, 2));
  
  // Validate that user input was preserved
  const preservationWarnings = validateUserInputPreservation(parsed, userDetails);
  if (preservationWarnings.length > 0) {
    console.warn('⚠️ User input preservation issues:', preservationWarnings);
  }
  
  return parsed;
} catch (error) {
  console.error('Failed to parse V3 identity JSON:', content);
  throw new Error('Invalid JSON response from OpenAI for V3 identity');
}
}

// Stage 2: V3 Life Context
export async function generateLifeContext(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 life context for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate compelling life context that makes this persona distinctive and memorable. Create someone with a rich, specific life story. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "life_context": {
    "supports": [
      "Close friend group from college",
      "Supportive romantic partner",
      "Weekly therapy sessions",
      "Active online community for designers"
    ],
    "stressors": [
      "Aging parents needing more help",
      "Imposter syndrome at work",
      "Rising rent costs",
      "Creative burnout from client demands"
    ],
    "daily_routine": "Early riser who starts with meditation and coffee, works from home most days, takes long walks during lunch, evening cooking experiments, weekend art projects and social gatherings",
    "current_situation": "Recently promoted to senior UX designer but feeling overwhelmed by leadership responsibilities while maintaining creative output. Partner is considering job relocation which creates uncertainty about future plans.",
    "background_narrative": "Grew up in a traditional Korean household but always felt drawn to creative fields. Parents wanted them to be a doctor, but they found their passion in design during college. Struggled with identity and family expectations before finding their voice and community in the design world.",
    "lifestyle": "Health-conscious creative with strong work-life boundaries, values authentic relationships over networking, prefers small gatherings over large parties, passionate about sustainable design and ethical consumption"
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Create specific, detailed supports and stressors (not generic ones)
- Daily routine should reflect their personality and priorities
- Current situation should have interesting tensions or developments
- Background narrative should explain how they became who they are
- Lifestyle should show their values and preferences clearly
- Make them feel like a real person with a compelling story`
    },
    {
      role: "user",
      content: `Generate life context for: ${basePersona.name} (${basePersona.identity.occupation}, ${basePersona.identity.age}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 1500
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 life context JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 life context');
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

// Stage 3: V3 Knowledge Profile
export async function generateKnowledgeProfile(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 knowledge profile for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate a distinctive knowledge profile that reflects this persona's background, interests, and expertise. Avoid generic ratings - create a knowledge signature that makes them unique. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "knowledge_profile": {
    "general_knowledge_level": "high",
    "tech_literacy": "high",
    "domains_of_expertise": [
      "User Experience Design",
      "Korean Culture and Language",
      "Sustainable Design Practices",
      "Digital Art Techniques"
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

DISTINCTIVENESS REQUIREMENTS:
- General/tech literacy should reflect their background and generation
- Domains of expertise should be specific, not generic (e.g., "UX Design" not "computers")
- Knowledge domains (1-5 scale) should create a clear profile, not all 3s
- Give them 2-3 areas of genuine expertise (4-5) and 2-3 areas of low knowledge (1-2)
- Should align with their occupation, background, and interests
- Make their knowledge profile tell a story about who they are`
    },
    {
      role: "user",
      content: `Generate knowledge profile for: ${basePersona.name} (${basePersona.identity.occupation}, age ${basePersona.identity.age}, ${basePersona.identity.cultural_background}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 1200
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 knowledge profile JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 knowledge profile');
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

// Stage 4: V3 Cognitive Profile 
export async function generateCognitiveProfile(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 cognitive profile for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate a distinctive cognitive profile that creates a unique personality signature. Avoid generic midline values - make this persona memorable with clear psychological patterns. Return ONLY valid JSON.

CRITICAL: Create someone with personality! Avoid bland, default characteristics. Make them psychologically distinctive with clear strengths, weaknesses, and quirks.

REQUIRED V3 STRUCTURE:
{
  "cognitive_profile": {
    "big_five": {
      "openness": 0.82,
      "neuroticism": 0.34,
      "extraversion": 0.71,
      "agreeableness": 0.68,
      "conscientiousness": 0.79
    },
    "extended_traits": {
      "empathy": 0.84,
      "self_efficacy": 0.76,
      "cognitive_flexibility": 0.88,
      "impulse_control": 0.72,
      "attention_pattern": 0.69,
      "manipulativeness": 0.18,
      "need_for_cognitive_closure": 0.31,
      "institutional_trust": 0.43
    },
    "intelligence": {
      "type": ["Creative Intelligence", "Emotional Intelligence", "Spatial Intelligence"],
      "level": "high"
    },
    "decision_style": "mixed",
    "behavioral_economics": {
      "present_bias": 0.38,
      "loss_aversion": 0.62,
      "overconfidence": 0.29,
      "risk_sensitivity": 0.74,
      "scarcity_sensitivity": 0.41
    },
    "moral_foundations": {
      "care_harm": 0.86,
      "fairness_cheating": 0.81,
      "loyalty_betrayal": 0.54,
      "authority_subversion": 0.32,
      "sanctity_degradation": 0.28,
      "liberty_oppression": 0.79
    },
    "social_identity": {
      "identity_strength": 0.77,
      "ingroup_bias_tendency": 0.39,
      "outgroup_bias_tendency": 0.23,
      "cultural_intelligence": 0.83,
      "system_justification": 0.35
    },
    "political_orientation": {
      "authoritarian_libertarian": 0.74,
      "economic": 0.41,
      "cultural_progressive_conservative": 0.82
    },
    "worldview_summary": "A compassionate progressive who believes in systemic change through creative innovation. Values individual freedom while maintaining strong empathy for others. Approaches problems with both analytical thinking and intuitive insight, preferring collaborative solutions that address root causes rather than symptoms."
  },
  "emotional_triggers": {
    "positive": ["creative recognition", "meaningful impact", "authentic connection"],
    "negative": ["micromanagement", "injustice", "superficiality"],
    "explosive": ["discrimination", "deliberate cruelty", "environmental destruction"]
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Big Five should show clear personality patterns, not all balanced around 0.5
- Give them 2-3 standout traits (>0.8 or <0.2) that define their character
- Intelligence types should reflect their background and interests specifically  
- Decision style should match their personality (logical/intuitive/mixed)
- Moral foundations should show clear value priorities, not equal ratings
- Worldview summary should capture their unique perspective in 1-2 sentences
- Triggers should be specific to their experiences and values, not generic
- Make them psychologically coherent - traits should work together to tell a story`
    },
    {
      role: "user",
      content: `Generate cognitive profile for: ${basePersona.name} (${basePersona.identity.occupation}, ${basePersona.identity.cultural_background}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 2000
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 cognitive profile JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 cognitive profile');
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

// V3 Export Aliases - matching what index.ts expects
export const generateV3Identity = generateCoreDemographics;
export const generateV3LifeContext = generateLifeContext;
export const generateV3KnowledgeProfile = generateKnowledgeProfile;
export const generateV3CognitiveProfile = generateCognitiveProfile;
export const generateV3Interview = generateInterviewResponses;
