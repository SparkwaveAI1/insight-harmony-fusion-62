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
export async function generatePersonaDemographics(prompt: string): Promise<any> {
  console.log(`Generating demographics from prompt: "${prompt}"`);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-2025-04-14",
    messages: [
      {
        role: "system",
        content: `You are an expert persona researcher. Generate comprehensive demographic data for a realistic persona based on the user's prompt.

CRITICAL: You MUST generate demographics using our complete PersonaMetadata structure, not a simplified version.

Return a JSON object with this exact structure:
{
  "persona_id": "generate unique ID like psc-YYYYMMDD-XXX",
  "name": "realistic full name",
  "creation_date": "current date",
  "user_id": "will be set by system",
  "metadata": {
    // Core Demographics - ALL REQUIRED
    "age": "specific age as string",
    "gender": "male/female/non-binary/other",
    "race_ethnicity": "specific ethnicity",
    "sexual_orientation": "heterosexual/homosexual/bisexual/other",
    "education_level": "high school/some college/bachelor's/master's/phd/other",
    "occupation": "specific job title",
    "employment_type": "full-time/part-time/self-employed/unemployed/retired/student",
    "income_level": "low/lower-middle/middle/upper-middle/high",
    "social_class_identity": "working class/middle class/upper class",
    "marital_status": "single/married/divorced/widowed/domestic partnership",
    "parenting_role": "no children/parent/stepparent/guardian/other",
    "relationship_history": "brief description",
    "military_service": "none/veteran/active duty/reserves",
    
    // Location & Environment
    "region": "specific region/state",
    "urban_rural_context": "urban/suburban/rural",
    "location_history": {
      "grew_up_in": "location",
      "current_residence": "current location", 
      "places_lived": ["list of places"]
    },
    "migration_history": "native/immigrant/second generation/other",
    "climate_risk_zone": "low/moderate/high",
    
    // Relationships & Family Dynamics
    "relationships_family": {
      "has_children": true/false,
      "number_of_children": number or null,
      "children_ages": [array of ages] or null,
      "stepchildren": true/false/null,
      "custody_arrangement": "description or null",
      "living_situation": "alone/with partner/with family/roommates/other",
      "household_composition": ["list of household members"],
      "primary_caregiver_responsibilities": "description or null",
      "eldercare_responsibilities": "description or null",
      "partner_spouse_relationship": "description or null",
      "partner_health_status": "description or null",
      "children_health_issues": "description or null",
      "family_relationship_quality": "excellent/good/fair/poor/complicated",
      "family_stressors": ["list of stressors"],
      "support_system_strength": "strong/moderate/weak/isolated",
      "extended_family_involvement": "high/moderate/low/none",
      "relationship_priorities": "description",
      "co_parenting_dynamics": "description or null"
    },
    
    // Cognitive, Psychological, and Cultural
    "language_proficiency": ["list of languages"],
    "religious_affiliation": "specific religion or none",
    "religious_practice_level": "devout/moderate/occasional/non-practicing/atheist",
    "cultural_background": "description",
    "cultural_affiliation": ["list of cultural groups"],
    "political_affiliation": "conservative/liberal/moderate/independent/other",
    "political_sophistication": "high/moderate/low",
    "tech_familiarity": "expert/proficient/basic/limited",
    "learning_modality": "visual/auditory/kinesthetic/reading",
    "trust_in_institutions": "high/moderate/low/very low",
    "trauma_exposure": "none/minimal/moderate/significant",
    
    // Financial and Time Resource Profile
    "financial_pressure": "none/low/moderate/high/severe",
    "credit_access": "excellent/good/fair/poor/none",
    "debt_load": "none/low/moderate/high/overwhelming",
    "time_abundance": "abundant/sufficient/limited/scarce",
    
    // Digital Ecosystem & Signaling Behavior
    "media_ecosystem": ["list of media sources"],
    "aesthetic_subculture": "description or none",
    
    // Health-Related Attributes
    "physical_health_status": "excellent/good/fair/poor",
    "mental_health_status": "excellent/good/fair/poor/struggling",
    "health_prioritization": "high/moderate/low",
    "healthcare_access": "excellent/good/limited/poor",
    "chronic_conditions": ["list or empty"],
    "medications": ["list or empty"],
    "mental_health_history": "description or none",
    "therapy_counseling_experience": "extensive/some/none",
    "health_insurance_status": "comprehensive/basic/limited/uninsured",
    "fitness_activity_level": "very active/active/moderate/sedentary",
    "dietary_restrictions": ["list or empty"],
    "sleep_patterns": "excellent/good/fair/poor/disordered",
    "stress_management": "excellent/good/fair/poor",
    "substance_use": "none/occasional/regular/concerning",
    "health_family_history": "description",
    "disability_accommodations": "description or none",
    
    // Physical Description
    "height": "height description",
    "build_body_type": "description",
    "hair_color": "color",
    "hair_style": "style description",
    "eye_color": "color", 
    "skin_tone": "description",
    "distinctive_features": ["list or empty"],
    "style_fashion_sense": "description",
    "grooming_habits": "description",
    "physical_mannerisms": ["list or empty"],
    "posture_bearing": "description",
    "voice_speech_patterns": "description",
    
    // Knowledge Domains (1-5 scale: 1=minimal, 5=expert)
    "knowledge_domains": {
      "finance_basics": 1-5,
      "crypto_blockchain": 1-5,
      "world_politics": 1-5,
      "national_politics": 1-5,
      "pop_culture": 1-5,
      "basic_technology": 1-5,
      "deep_technology": 1-5,
      "health_medicine": 1-5,
      "advanced_medical": 1-5,
      "science_concepts": 1-5,
      "sports": 1-5,
      "news_literacy": 1-5,
      "environmental_issues": 1-5,
      "cultural_history": 1-5,
      "law_legal": 1-5,
      "religion_spirituality": 1-5,
      "art_literature": 1-5,
      "gaming": 1-5,
      "food_cooking": 1-5,
      "travel_geography": 1-5,
      "parenting_childcare": 1-5,
      "home_improvement": 1-5,
      "business_entrepreneurship": 1-5,
      "psychology_social_science": 1-5,
      "economics": 1-5
    }
  }
}

Make this persona realistic and internally consistent. Base ALL demographics on the prompt provided. Ensure every required field has a realistic value - no nulls for required fields.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 4000
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from OpenAI');
  }

  try {
    const parsed = JSON.parse(content);
    console.log('Demographics Generation: Successfully parsed JSON response');
    console.log(`Generated demographics for: ${parsed.name}`);
    return parsed;
  } catch (error) {
    console.error('Failed to parse OpenAI response as JSON:', error);
    console.error('Raw response:', content);
    throw new Error(`Invalid JSON response from OpenAI: ${error.message}`);
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
