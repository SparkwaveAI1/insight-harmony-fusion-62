import { generateChatResponse } from "../_shared/openai.ts";
import { INTERVIEW_SECTIONS } from "./interviewData.ts";

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

// Stage 8: Complete Trait Profile - All 9 Categories
export async function generateTraitProfile(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating complete trait profile for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system", 
      content: `Generate a complete psychological trait profile for the persona. Return ONLY valid JSON with trait values between 0.0-1.0.

CRITICAL: Generate ALL 9 trait categories with EXACT field names. Avoid default values of exactly 0.5. Use varied, realistic values.

Return this EXACT structure with ALL categories:
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
      "care": 0.78,
      "fairness": 0.85,
      "loyalty": 0.63,
      "authority": 0.42,
      "sanctity": 0.38,
      "liberty": 0.72
    },
    "world_values": {
      "traditional_vs_secular": 0.34,
      "survival_vs_self_expression": 0.76,
      "materialist_vs_postmaterialist": 0.58
    },
    "political_compass": {
      "economic": 0.45,
      "authoritarian_libertarian": 0.68,
      "cultural_conservative_progressive": 0.72,
      "political_salience": 0.52,
      "group_fusion_level": 0.39,
      "outgroup_threat_sensitivity": 0.31,
      "commons_orientation": 0.64,
      "political_motivations": {
        "material_interest": 0.43,
        "moral_vision": 0.78,
        "cultural_preservation": 0.29,
        "status_reordering": 0.51
      }
    },
    "behavioral_economics": {
      "present_bias": 0.42,
      "loss_aversion": 0.67,
      "overconfidence": 0.38,
      "risk_sensitivity": 0.73,
      "scarcity_sensitivity": 0.45
    },
    "cultural_dimensions": {
      "power_distance": 0.41,
      "individualism_vs_collectivism": 0.74,
      "masculinity_vs_femininity": 0.52,
      "uncertainty_avoidance": 0.63,
      "long_term_orientation": 0.69,
      "indulgence_vs_restraint": 0.47
    },
    "social_identity": {
      "identity_strength": 0.71,
      "identity_complexity": 0.58,
      "ingroup_bias_tendency": 0.44,
      "outgroup_bias_tendency": 0.32,
      "social_dominance_orientation": 0.28,
      "system_justification": 0.51,
      "intergroup_contact_comfort": 0.76,
      "cultural_intelligence": 0.68
    },
    "extended_traits": {
      "truth_orientation": 0.82,
      "moral_consistency": 0.74,
      "self_awareness": 0.67,
      "empathy": 0.79,
      "self_efficacy": 0.71,
      "manipulativeness": 0.23,
      "impulse_control": 0.68,
      "shadow_trait_activation": 0.34,
      "attention_pattern": 0.63,
      "cognitive_load_resilience": 0.72,
      "institutional_trust": 0.48,
      "conformity_tendency": 0.41,
      "conflict_avoidance": 0.52,
      "cognitive_flexibility": 0.75,
      "need_for_cognitive_closure": 0.38,
      "emotional_intensity": 0.64,
      "emotional_regulation": 0.69,
      "trigger_sensitivity": 0.46
    },
    "dynamic_state": {
      "current_stress_level": 0.42,
      "emotional_stability_context": 0.67,
      "motivation_orientation": 0.73,
      "trust_volatility": 0.39,
      "trigger_threshold": 0.58
    }
  },
  "emotional_triggers": {
    "positive_triggers": [
      {
        "keywords": ["recognition", "achievement"],
        "emotion_type": "pride",
        "intensity_multiplier": 1.2,
        "description": "Professional recognition and accomplishments"
      }
    ],
    "negative_triggers": [
      {
        "keywords": ["micromanagement", "control"],
        "emotion_type": "frustration",
        "intensity_multiplier": 1.4,
        "description": "Excessive oversight and control"
      }
    ]
  }
}

Generate realistic, varied values that create a unique personality profile based on the persona's background and context.`
    },
    {
      role: "user",
      content: `Generate complete trait profile for: ${basePersona.name}\nContext: ${prompt}\nBackground: ${JSON.stringify(basePersona.metadata, null, 2)}`
    }
  ];

  // CRITICAL FIX: Increase max_tokens to handle the much larger comprehensive trait profile
  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.8,
    max_tokens: 3000  // Increased from default ~1000 to 3000 for comprehensive trait profile
  });
  
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

// Stage 10: Enhanced Interview Responses using detailed structure
export async function generateInterviewResponses(basePersona: any): Promise<any[]> {
  console.log(`Generating detailed interview responses for: ${basePersona.name}`);
  
  // Create a summary of key sections for context
  const interviewSectionSummary = INTERVIEW_SECTIONS.slice(0, 6).map(section => ({
    title: section.section,
    focus: section.notes,
    sampleQuestions: section.questions.slice(0, 3)
  }));
  
  const messages = [
    {
      role: "system",
      content: `Generate comprehensive interview responses for the persona based on detailed interview sections. Return ONLY valid JSON array.

You will generate responses for key interview sections that cover the persona's background, values, daily life, and perspectives. Each section should have 2-3 thoughtful responses that reflect the persona's personality traits and background.

REQUIRED STRUCTURE:
[
  {
    "section_title": "Introduction & Tone Calibration", 
    "responses": [
      {
        "question": "What's something you've been thinking about lately?",
        "answer": "Detailed, authentic response reflecting persona's traits..."
      },
      {
        "question": "What's something that recently made you pause or think twice?", 
        "answer": "Another thoughtful response..."
      }
    ]
  },
  {
    "section_title": "Daily Life & Rhythms",
    "responses": [
      {
        "question": "Walk me through a typical morning for you",
        "answer": "Detailed response about daily routine..."
      }
    ]
  }
]

Generate responses for these key sections: Introduction & Tone Calibration, Daily Life & Rhythms, Values & Decision Making, Relationships & Social Life, Future Outlook & Goals, and Personal Reflection.

Make responses authentic, conversational, and reflect the persona's specific traits, background, and personality profile.`
    },
    {
      role: "user", 
      content: `Generate detailed interview responses for: ${basePersona.name}
      
Background: ${JSON.stringify(basePersona.metadata, null, 2)}

Key trait insights: ${basePersona.trait_profile ? JSON.stringify({
  openness: basePersona.trait_profile.big_five?.openness,
  conscientiousness: basePersona.trait_profile.big_five?.conscientiousness,
  extraversion: basePersona.trait_profile.big_five?.extraversion
}, null, 2) : 'Traits being generated'}

Create responses that sound like this person talking naturally, reflecting their specific personality and background.`
    }
  ];

  // CRITICAL FIX: Increase max_tokens significantly for detailed interview responses
  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.8,
    max_tokens: 2500  // Increased from default ~1000 to 2500 for detailed interviews
  });
  
  const content = response.choices[0].message.content;
  
  try {
    const parsedResponse = JSON.parse(content);
    console.log(`✅ Generated ${parsedResponse.length} detailed interview sections`);
    return parsedResponse;
  } catch (error) {
    console.error('Failed to parse detailed interview JSON, using structured fallback:', content);
    
    // Enhanced fallback that creates multiple sections instead of just one
    return [
      {
        section_title: "Personal Background",
        responses: [
          {
            question: "Tell me about yourself",
            answer: `Hi, I'm ${basePersona.name}. ${basePersona.metadata.background || 'I work in ' + (basePersona.metadata.occupation || 'my field') + ' and I\'m passionate about what I do.'}`
          },
          {
            question: "What drives you day to day?",
            answer: `${basePersona.metadata.occupation ? 'My work as a ' + basePersona.metadata.occupation + ' keeps me engaged, ' : ''}and I find motivation in continuous learning and growth.`
          }
        ]
      },
      {
        section_title: "Values & Perspectives", 
        responses: [
          {
            question: "What matters most to you?",
            answer: `I value authenticity and meaningful connections. ${basePersona.metadata.education_level ? 'My ' + basePersona.metadata.education_level + ' background' : 'My experiences'} have shaped how I approach problems and relationships.`
          }
        ]
      }
    ];
  }
}
