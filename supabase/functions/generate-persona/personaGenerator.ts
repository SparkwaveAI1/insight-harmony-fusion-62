
import { PersonaTemplate } from "./types.ts";
import { 
  generateCoreDemographics,
  generateLocationContext,
  generateFamilyRelationships,
  generateHealthAttributes,
  generatePhysicalDescription,
  generateKnowledgeDomains,
  generatePsychologicalCultural,
  generateTraitProfile,
  generateBehavioralLinguistic,
  generateInterviewResponses
} from "./openaiService.ts";
import { validateAndCleanTraits } from "./traitValidator.ts";
import { 
  validateUserPrompt, 
  validateGeneratedPersona, 
  validateTraitValues 
} from "./validationService.ts";
import { 
  PersonaGenerationError, 
  wrapWithErrorHandling 
} from "./errorHandler.ts";
import { withRetry } from "./retryService.ts";
import { 
  validateTraitRealism, 
  validateDemographicStructure, 
  validateCompleteMetadata,
  validatePersonaUniqueness 
} from "./validationHelpers.ts";

export async function generateBasePersona(prompt: string): Promise<PersonaTemplate> {
  console.log('=== STAGE 1: GENERATING CORE DEMOGRAPHICS ===');
  
  const basePersona = await wrapWithErrorHandling(
    () => withRetry(
      () => generateCoreDemographics(prompt),
      { maxRetries: 2 },
      'Core Demographics Generation'
    ),
    'demographics',
    { prompt: prompt.substring(0, 100) + '...' }
  );

  console.log(`✅ Generated base persona "${basePersona.name}"`);
  
  // Validate ONLY core demographic structure (Stage 1 fields)
  const demographicValidation = validateDemographicStructure(basePersona.metadata);
  if (!demographicValidation.isValid) {
    console.error('❌ Core demographic validation failed:', demographicValidation.errors);
    throw new PersonaGenerationError(
      'demographics',
      `Core demographics validation failed: ${demographicValidation.errors.join(', ')}`,
      undefined,
      { personaName: basePersona.name, errors: demographicValidation.errors }
    );
  }
  
  return basePersona;
}

export async function enhancePersonaMetadata(basePersona: PersonaTemplate, prompt: string): Promise<PersonaTemplate> {
  console.log('=== STAGE 2-7: ENHANCING METADATA ===');
  
  // Stage 2: Location & Context
  console.log('Generating location & context...');
  const locationContext = await wrapWithErrorHandling(
    () => withRetry(
      () => generateLocationContext(basePersona, prompt),
      { maxRetries: 1 },
      'Location Context Generation'
    ),
    'location_context',
    { personaName: basePersona.name }
  );
  
  // Stage 3: Family & Relationships
  console.log('Generating family & relationships...');
  const familyRelationships = await wrapWithErrorHandling(
    () => withRetry(
      () => generateFamilyRelationships(basePersona, prompt),
      { maxRetries: 1 },
      'Family Relationships Generation'
    ),
    'family_relationships',
    { personaName: basePersona.name }
  );
  
  // Stage 4: Health Attributes
  console.log('Generating health attributes...');
  const healthAttributes = await wrapWithErrorHandling(
    () => withRetry(
      () => generateHealthAttributes(basePersona, prompt),
      { maxRetries: 1 },
      'Health Attributes Generation'
    ),
    'health_attributes',
    { personaName: basePersona.name }
  );
  
  // Stage 5: Physical Description
  console.log('Generating physical description...');
  const physicalDescription = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePhysicalDescription(basePersona, prompt),
      { maxRetries: 1 },
      'Physical Description Generation'
    ),
    'physical_description',
    { personaName: basePersona.name }
  );
  
  // Stage 6: Knowledge Domains
  console.log('Generating knowledge domains...');
  const knowledgeDomains = await wrapWithErrorHandling(
    () => withRetry(
      () => generateKnowledgeDomains(basePersona, prompt),
      { maxRetries: 1 },
      'Knowledge Domains Generation'
    ),
    'knowledge_domains',
    { personaName: basePersona.name }
  );
  
  // Stage 7: Psychological & Cultural
  console.log('Generating psychological & cultural data...');
  const psychologicalCultural = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePsychologicalCultural(basePersona, prompt),
      { maxRetries: 1 },
      'Psychological Cultural Generation'
    ),
    'psychological_cultural',
    { personaName: basePersona.name }
  );
  
  // Merge all metadata - keep nested structure for validation
  Object.assign(basePersona.metadata, {
    ...locationContext.location_context,
    relationships_family: familyRelationships.relationships_family,
    ...healthAttributes.health_attributes,
    ...physicalDescription.physical_description,
    knowledge_domains: knowledgeDomains.knowledge_domains,
    ...psychologicalCultural.psychological_cultural
  });
  
  // Now validate complete metadata after all stages
  const completeValidation = validateCompleteMetadata(basePersona.metadata);
  if (!completeValidation.isValid) {
    console.warn('⚠️ Complete metadata validation failed:', completeValidation.errors);
    // Don't throw error, just warn - we can continue with incomplete data
  }
  
  console.log('✅ Enhanced metadata with all comprehensive attributes');
  return basePersona;
}

export async function generatePersonaTraitProfile(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 8: GENERATING TRAIT PROFILE ===');
  
  let traitData;
  let attemptCount = 0;
  const maxTraitAttempts = 3;
  
  do {
    attemptCount++;
    console.log(`=== TRAIT GENERATION ATTEMPT ${attemptCount}/${maxTraitAttempts} ===`);
    
    try {
      traitData = await wrapWithErrorHandling(
        () => withRetry(
          () => generateTraitProfile(basePersona, prompt),
          { maxRetries: 1 },
          'Trait Profile Generation'
        ),
        'traits',
        { personaName: basePersona.name, attempt: attemptCount }
      );

      // Validate trait realism
      const traitValidation = validateTraitRealism(traitData.trait_profile);
      
      if (!traitValidation.isValid) {
        console.error(`❌ Trait validation failed on attempt ${attemptCount}:`, traitValidation.errors);
        console.error(`Default ratio: ${Math.round(traitValidation.defaultRatio * 100)}%`);
        
        if (attemptCount >= maxTraitAttempts) {
          throw new PersonaGenerationError(
            'traits',
            `Failed to generate realistic traits after ${maxTraitAttempts} attempts. Last error: ${traitValidation.errors.join(', ')}`,
            undefined,
            { 
              personaName: basePersona.name, 
              finalDefaultRatio: traitValidation.defaultRatio,
              attempts: attemptCount 
            }
          );
        }
        
        console.warn(`⚠️ Retrying trait generation (attempt ${attemptCount + 1}/${maxTraitAttempts})`);
        continue;
      }
      
      console.log(`✅ Trait validation passed on attempt ${attemptCount}`);
      console.log(`Default ratio: ${Math.round(traitValidation.defaultRatio * 100)}% (threshold: ≤30%)`);
      break;
      
    } catch (error) {
      console.error(`Trait generation attempt ${attemptCount} failed:`, error.message);
      
      if (attemptCount >= maxTraitAttempts) {
        throw new PersonaGenerationError(
          'traits',
          `All trait generation attempts failed. Last error: ${error.message}`,
          error,
          { personaName: basePersona.name, attempts: attemptCount }
        );
      }
    }
  } while (attemptCount < maxTraitAttempts);

  console.log('✅ Generated and validated realistic trait profile');
  
  // Validate trait values
  const traitValidation = validateTraitValues(traitData.trait_profile);
  if (!traitValidation.isValid) {
    console.error('Final trait validation failed:', traitValidation.errors);
  }
  
  return { traitData, attemptCount };
}

export async function generatePersonaBehavioralLinguistic(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 9: GENERATING BEHAVIORAL & LINGUISTIC PROFILES ===');
  
  const behavioralLinguistic = await wrapWithErrorHandling(
    () => withRetry(
      () => generateBehavioralLinguistic(basePersona, prompt),
      { maxRetries: 1 },
      'Behavioral Linguistic Generation'
    ),
    'behavioral_linguistic',
    { personaName: basePersona.name }
  );
  
  console.log('✅ Generated behavioral and linguistic profiles');
  return behavioralLinguistic;
}

export async function generatePersonaInterview(basePersona: PersonaTemplate): Promise<any[]> {
  console.log('=== STAGE 10: GENERATING INTERVIEW RESPONSES ===');
  
  try {
    const interviewResponses = await wrapWithErrorHandling(
      () => withRetry(
        () => generateInterviewResponses(basePersona),
        { maxRetries: 1 },
        'Interview Generation'
      ),
      'interview',
      { personaName: basePersona.name }
    );
    console.log(`✅ Generated ${interviewResponses.length} interview sections`);
    return interviewResponses;
  } catch (error) {
    console.warn('Interview generation failed, using minimal fallback:', error.message);
    return [
      {
        section_title: "Personal Background",
        responses: [
          {
            question: "Tell me about yourself",
            answer: `Hi, I'm ${basePersona.name}. ${basePersona.metadata.background || 'I\'d be happy to share more about my experiences and perspective.'}`
          }
        ]
      }
    ];
  }
}

export function finalizePersona(
  basePersona: PersonaTemplate, 
  traitData: any, 
  behavioralLinguistic: any, 
  interviewResponses: any[]
): any {
  console.log('=== FINALIZING PERSONA AS PersonaV2 ===');
  
  // Generate description from traits and metadata
  const description = generatePersonaDescription(basePersona, traitData);
  
  // Map PersonaTemplate to PersonaV2 structure
  const personaV2 = mapToPersonaV2(basePersona, traitData, behavioralLinguistic, interviewResponses, description);

  console.log('✅ Persona finalized as PersonaV2 format');
  return personaV2;
}

function mapToPersonaV2(
  basePersona: PersonaTemplate,
  traitData: any,
  behavioralLinguistic: any,
  interviewResponses: any[],
  description: string
): any {
  // Map trait_profile to Big Five format
  const bigFive = traitData.trait_profile?.big_five || {};
  const moralFoundations = traitData.trait_profile?.moral_foundations || {};
  const worldValues = traitData.trait_profile?.world_values || {};
  const politicalCompass = traitData.trait_profile?.political_compass || {};

  return {
    identity: {
      name: basePersona.name,
      age: basePersona.metadata.age || 30,
      gender: basePersona.metadata.gender || "non-binary",
      sexual_orientation: basePersona.metadata.sexual_orientation || "heterosexual",
      race_ethnicity: basePersona.metadata.race_ethnicity || "mixed",
      nationality: basePersona.metadata.region || "American",
      languages: basePersona.metadata.language_proficiency || ["English"],
      core_identity_narrative: description
    },
    
    life_context: {
      current_location: {
        country: basePersona.metadata.region || "United States",
        city: basePersona.metadata.location || "Unknown",
        neighborhood_type: basePersona.metadata.urban_rural_context || "suburban",
        living_situation: basePersona.metadata.relationships_family?.living_situation || "apartment"
      },
      occupation: {
        title: basePersona.metadata.occupation || "Professional",
        industry: "Unknown",
        employment_status: basePersona.metadata.employment_type || "full_time",
        work_setting: "office",
        experience_years: 5,
        income_bracket: basePersona.metadata.income_level || "middle"
      },
      education: {
        highest_degree: basePersona.metadata.education_level || "bachelor",
        field_of_study: "General Studies",
        continuing_education: false
      },
      family_structure: {
        marital_status: basePersona.metadata.marital_status || "single",
        children: basePersona.metadata.relationships_family?.has_children || false,
        household_size: 1,
        caregiver_responsibilities: basePersona.metadata.relationships_family?.primary_caregiver_responsibilities || "none"
      },
      health_status: {
        physical_health: basePersona.metadata.physical_health_status || "good",
        mental_health: basePersona.metadata.mental_health_status || "stable",
        chronic_conditions: basePersona.metadata.chronic_conditions || [],
        healthcare_access: basePersona.metadata.healthcare_access || "good"
      },
      financial_situation: {
        income_stability: "stable",
        debt_level: basePersona.metadata.debt_load || "moderate",
        financial_stress: basePersona.metadata.financial_pressure || "low",
        economic_outlook: "optimistic"
      }
    },

    cognitive_profile: {
      big_five: {
        openness: bigFive.openness || 0.5,
        conscientiousness: bigFive.conscientiousness || 0.5,
        extraversion: bigFive.extraversion || 0.5,
        agreeableness: bigFive.agreeableness || 0.5,
        neuroticism: bigFive.neuroticism || 0.5
      },
      moral_foundations: {
        care_harm: moralFoundations.care || 0.5,
        fairness_cheating: moralFoundations.fairness || 0.5,
        loyalty_betrayal: moralFoundations.loyalty || 0.5,
        authority_subversion: moralFoundations.authority || 0.5,
        sanctity_degradation: moralFoundations.sanctity || 0.5,
        liberty_oppression: moralFoundations.liberty || 0.5
      },
      cognitive_style: {
        analytical_intuitive: 0.5,
        detail_big_picture: 0.5,
        concrete_abstract: 0.5,
        systematic_flexible: bigFive.conscientiousness || 0.5
      },
      decision_making: {
        risk_tolerance: traitData.trait_profile?.behavioral_economics?.risk_sensitivity || 0.5,
        time_horizon: "medium_term",
        information_processing: "balanced",
        uncertainty_comfort: 0.5
      },
      learning_style: {
        preferred_modalities: ["visual", "auditory"],
        information_depth: "moderate",
        feedback_sensitivity: bigFive.neuroticism || 0.5
      }
    },

    social_cognition: {
      social_orientation: {
        introversion_extraversion: bigFive.extraversion || 0.5,
        cooperation_competition: bigFive.agreeableness || 0.5,
        trust_suspicion: 0.5,
        empathy_level: bigFive.agreeableness || 0.5
      },
      communication_style: {
        directness: 0.5,
        emotional_expressiveness: bigFive.extraversion || 0.5,
        formality_preference: 0.5,
        conflict_approach: "collaborative"
      },
      group_dynamics: {
        leadership_style: "collaborative",
        followership_style: "engaged",
        team_role_preference: "contributor",
        social_influence_susceptibility: 0.5
      },
      cultural_adaptation: {
        cultural_intelligence: 0.5,
        adaptability: bigFive.openness || 0.5,
        cross_cultural_comfort: 0.5
      }
    },

    health_profile: {
      physical_status: {
        overall_health: basePersona.metadata.physical_health_status || "good",
        fitness_level: basePersona.metadata.fitness_activity_level || "moderate",
        chronic_conditions: basePersona.metadata.chronic_conditions || [],
        health_priorities: ["general_wellness"]
      },
      mental_wellness: {
        stress_management: basePersona.metadata.stress_management || "moderate",
        emotional_regulation: bigFive.neuroticism ? (1 - bigFive.neuroticism) : 0.5,
        support_systems: "adequate",
        mental_health_awareness: 0.7
      },
      lifestyle_factors: {
        sleep_quality: basePersona.metadata.sleep_patterns || "good",
        exercise_habits: "moderate",
        nutrition_approach: "balanced",
        substance_use: basePersona.metadata.substance_use || "minimal"
      }
    },

    sexuality_profile: {
      orientation: {
        romantic_orientation: basePersona.metadata.sexual_orientation || "heterosexual",
        sexual_orientation: basePersona.metadata.sexual_orientation || "heterosexual",
        relationship_style: "monogamous"
      },
      intimacy_approach: {
        emotional_intimacy_comfort: bigFive.agreeableness || 0.5,
        physical_intimacy_comfort: 0.5,
        vulnerability_sharing: bigFive.openness || 0.5,
        boundary_communication: 0.7
      },
      relationship_patterns: {
        attachment_style: "secure",
        jealousy_tendency: bigFive.neuroticism || 0.3,
        commitment_approach: "gradual",
        past_relationship_impact: "low"
      },
      sexuality_expression: {
        comfort_with_sexuality_topics: 0.5,
        sexual_communication_style: "open",
        sexual_confidence: 0.5,
        exploration_openness: bigFive.openness || 0.5
      },
      privacy_boundaries: {
        disclosure_comfort: 0.5,
        topic_boundaries: ["personal_details"],
        context_adaptation: 0.7
      }
    },

    knowledge_base: {
      formal_education: basePersona.metadata.knowledge_domains || {},
      professional_expertise: {
        primary_domain: basePersona.metadata.occupation || "general",
        skill_level: "intermediate",
        years_experience: 5
      },
      interests_hobbies: ["reading", "technology"],
      cultural_knowledge: {
        pop_culture_awareness: 0.6,
        historical_knowledge: 0.5,
        current_events_following: 0.6
      }
    },

    emotional_triggers: {
      positive_activators: traitData.emotional_triggers?.positive_triggers || ["achievement", "connection"],
      negative_activators: traitData.emotional_triggers?.negative_triggers || ["criticism", "conflict"],
      stress_responses: ["withdrawal", "problem_solving"],
      comfort_mechanisms: ["social_support", "routine"],
      emotional_volatility: bigFive.neuroticism || 0.3
    },

    memory_profile: {
      autobiographical_anchors: [
        `Growing up in ${basePersona.metadata.location || 'their hometown'}`,
        `Their career as a ${basePersona.metadata.occupation || 'professional'}`
      ],
      emotional_memories: {
        formative_positive: ["educational_achievement"],
        formative_negative: ["academic_pressure"],
        recent_significant: ["career_transition"]
      },
      knowledge_organization: {
        memory_style: "episodic_semantic_blend",
        detail_retention: "moderate",
        pattern_recognition: 0.6
      }
    },

    linguistic_style: {
      vocabulary: {
        complexity_level: "moderate",
        domain_specific_terms: [basePersona.metadata.occupation || "general"],
        colloquialisms: ["modern_casual"],
        formal_register_comfort: 0.6
      },
      syntax_patterns: {
        sentence_structure: "varied",
        clause_complexity: "moderate",
        passive_voice_usage: 0.3,
        question_formation_style: "direct"
      },
      discourse_markers: {
        transition_usage: "moderate",
        hedging_patterns: bigFive.agreeableness ? ["I think", "perhaps"] : ["definitely", "clearly"],
        emphasis_strategies: ["repetition", "intensifiers"],
        politeness_markers: bigFive.agreeableness || 0.5
      },
      cultural_linguistic_features: {
        regional_markers: [],
        generational_markers: ["millennial"],
        professional_jargon: [basePersona.metadata.occupation || "general"],
        code_switching_patterns: "context_appropriate"
      }
    },

    group_behavior: {
      ingroup_outgroup: {
        identity_strength: 0.6,
        ingroup_loyalty: moralFoundations.loyalty || 0.5,
        outgroup_tolerance: bigFive.openness || 0.5,
        tribal_thinking_susceptibility: 0.4
      },
      leadership_followership: {
        natural_leadership: bigFive.extraversion || 0.5,
        authority_deference: moralFoundations.authority || 0.5,
        initiative_taking: 0.5,
        collaborative_preference: bigFive.agreeableness || 0.5
      },
      social_influence: {
        conformity_tendency: 0.5,
        persuasion_susceptibility: 0.5,
        social_proof_influence: 0.5,
        authority_influence: moralFoundations.authority || 0.5
      }
    },

    reasoning_modifiers: {
      cognitive_biases: {
        confirmation_bias: 0.5,
        availability_heuristic: 0.5,
        anchoring_bias: 0.5,
        overconfidence_bias: traitData.trait_profile?.behavioral_economics?.overconfidence || 0.5
      },
      emotional_reasoning: {
        affect_heuristic: bigFive.neuroticism || 0.3,
        mood_congruent_thinking: 0.5,
        emotional_override_logic: 0.3
      },
      motivated_reasoning: {
        belief_preservation: 0.5,
        dissonance_reduction: 0.5,
        selective_attention: 0.5
      }
    },

    runtime_controls: {
      response_length_preference: "moderate",
      topic_engagement_variability: 0.3,
      consistency_vs_authenticity: 0.7,
      emotional_range_expression: 0.6,
      knowledge_boundary_respect: 0.9,
      personality_drift_resistance: 0.8
    }
  };
}

function generatePersonaDescription(persona: PersonaTemplate, traits: any): string {
  // Extract key characteristics
  const name = persona.name;
  const age = persona.metadata?.age;
  const occupation = persona.metadata?.occupation;
  const location = persona.metadata?.location;
  
  // Analyze traits
  const bigFive = traits.trait_profile?.big_five || {};
  const worldValues = traits.trait_profile?.world_values || {};
  const moral = traits.trait_profile?.moral_foundations || {};
  
  const personalityTraits: string[] = [];
  
  // Big Five analysis
  if (bigFive.extraversion > 0.7) personalityTraits.push("outgoing and energetic");
  else if (bigFive.extraversion < 0.3) personalityTraits.push("reserved and thoughtful");
  
  if (bigFive.openness > 0.7) personalityTraits.push("creative and curious");
  else if (bigFive.openness < 0.3) personalityTraits.push("practical and traditional");
  
  if (bigFive.conscientiousness > 0.7) personalityTraits.push("organized and disciplined");
  else if (bigFive.conscientiousness < 0.3) personalityTraits.push("flexible and spontaneous");
  
  if (bigFive.agreeableness > 0.7) personalityTraits.push("compassionate and cooperative");
  else if (bigFive.agreeableness < 0.3) personalityTraits.push("direct and competitive");
  
  // Values analysis
  const valueTraits: string[] = [];
  if (moral.care > 0.7) valueTraits.push("deeply caring");
  if (moral.fairness > 0.7) valueTraits.push("justice-oriented");
  if (moral.liberty > 0.7) valueTraits.push("freedom-loving");
  
  // Build description
  let description = `${name} is`;
  
  if (age) description += ` a ${age}-year-old`;
  if (occupation) description += ` ${occupation}`;
  if (location) description += ` from ${location}`;
  
  description += ".";
  
  if (personalityTraits.length > 0) {
    description += ` They are ${personalityTraits.slice(0, 2).join(" and ")}.`;
  }
  
  if (valueTraits.length > 0) {
    description += ` ${valueTraits.join(" and ")}.`;
  }
  
  return description;
}
