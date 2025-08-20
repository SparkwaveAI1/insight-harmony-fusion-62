import { Persona } from '../types/persona';
import { DbPersona } from '../types/db-models';
import { PersonaV3 } from '../../../types/persona-v3';

export function personaToDbPersona(persona: Persona): Omit<DbPersona, 'id' | 'created_at'> {
  // Convert legacy persona to V3 structure if needed
  const v3Data: PersonaV3 = persona.persona_data || convertLegacyToV3(persona);
  
  return {
    persona_id: persona.persona_id,
    name: persona.name,
    description: persona.description || null,
    user_id: persona.user_id,
    is_public: persona.is_public || false,
    updated_at: new Date().toISOString(),
    profile_image_url: persona.profile_image_url || null,
    prompt: persona.prompt || null,
    version: persona.version || '3.0',
    persona_data: v3Data
  };
}

export function dbPersonaToPersona(dbPersona: any): Persona {
  const hasPersonaData = dbPersona.persona_data && Object.keys(dbPersona.persona_data).length > 0;
  
  return {
    id: dbPersona.id,
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    description: dbPersona.description,
    created_at: dbPersona.created_at,
    updated_at: dbPersona.updated_at,
    user_id: dbPersona.user_id,
    is_public: dbPersona.is_public,
    profile_image_url: dbPersona.profile_image_url,
    prompt: dbPersona.prompt,
    version: dbPersona.version || '3.0',
    
    // Primary V3 structure
    persona_data: hasPersonaData ? dbPersona.persona_data : convertLegacyToV3(dbPersona),
    
    // Legacy support - expose key fields at root level for backwards compatibility
    metadata: hasPersonaData ? extractLegacyMetadata(dbPersona.persona_data) : dbPersona.metadata,
    trait_profile: hasPersonaData ? extractLegacyTraitProfile(dbPersona.persona_data) : dbPersona.trait_profile,
    interview_sections: hasPersonaData ? dbPersona.persona_data.interview_sections : dbPersona.interview_sections,
    emotional_triggers: hasPersonaData ? dbPersona.persona_data.emotional_triggers : dbPersona.emotional_triggers,
    enhanced_metadata_version: 3
  };
}

function convertLegacyToV3(legacy: any): PersonaV3 {
  const metadata = legacy.metadata || {};
  const traitProfile = legacy.trait_profile || {};
  
  return {
    persona_id: legacy.persona_id,
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    version: "3.0",
    created_at: legacy.created_at || new Date().toISOString(),
    updated_at: legacy.updated_at || new Date().toISOString(),
    user_id: legacy.user_id,
    is_public: legacy.is_public || false,
    profile_image_url: legacy.profile_image_url,
    prompt: legacy.prompt,
    
    identity: {
      age: metadata.age || 0,
      gender: metadata.gender || "unspecified",
      pronouns: metadata.pronouns || "they/them",
      ethnicity: metadata.ethnicity || metadata.race_ethnicity || "unspecified",
      nationality: metadata.nationality || "unspecified",
      occupation: metadata.occupation || "unemployed",
      relationship_status: metadata.relationship_status || metadata.marital_status || "single",
      dependents: metadata.dependents || 0,
      location: {
        city: metadata.city || "unknown",
        region: metadata.region || metadata.state || "unknown",
        country: metadata.country || "unknown"
      },
      socioeconomic_context: {
        income_level: metadata.income_level || "unknown",
        education_level: metadata.education || metadata.education_level || "unknown",
        social_class_identity: metadata.social_class_identity || "middle class",
        political_affiliation: metadata.political_affiliation || "unspecified",
        religious_affiliation: metadata.religious_affiliation || "unspecified",
        religious_practice_level: "medium",
        cultural_background: metadata.cultural_background || "unspecified",
        cultural_dimensions: {
          power_distance: 0.5,
          individualism_vs_collectivism: 0.5,
          masculinity_vs_femininity: 0.5,
          uncertainty_avoidance: 0.5,
          long_term_orientation: 0.5,
          indulgence_vs_restraint: 0.5
        }
      }
    },
    
    life_context: {
      supports: metadata.supports || [],
      stressors: metadata.stressors || [],
      daily_routine: metadata.daily_routine || "unknown",
      current_situation: metadata.current_situation || "unknown",
      background_narrative: metadata.background || legacy.description || "",
      lifestyle: metadata.lifestyle || "unknown"
    },
    
    knowledge_profile: {
      general_knowledge_level: "medium",
      tech_literacy: metadata.tech_literacy || "medium",
      domains_of_expertise: metadata.domains_of_expertise || [],
      knowledge_domains: metadata.knowledge_domains || {
        arts: 3, health: 3, sports: 3, finance: 3, history: 3,
        science: 3, business: 3, politics: 3, technology: 3, entertainment: 3
      }
    },
    
    cognitive_profile: {
      big_five: {
        openness: traitProfile.openness || 0.5,
        neuroticism: traitProfile.neuroticism || 0.5,
        extraversion: traitProfile.extraversion || 0.5,
        agreeableness: traitProfile.agreeableness || 0.5,
        conscientiousness: traitProfile.conscientiousness || 0.5
      },
      extended_traits: {
        empathy: traitProfile.empathy || 0.5,
        self_efficacy: traitProfile.self_efficacy || 0.5,
        cognitive_flexibility: 0.5,
        impulse_control: 0.5,
        attention_pattern: 0.5,
        manipulativeness: 0.2,
        need_for_cognitive_closure: 0.5,
        institutional_trust: 0.5
      },
      intelligence: {
        type: ["analytical"],
        level: "medium"
      },
      decision_style: "mixed",
      behavioral_economics: {
        present_bias: 0.3,
        loss_aversion: 0.6,
        overconfidence: 0.4,
        risk_sensitivity: 0.5,
        scarcity_sensitivity: 0.5
      },
      moral_foundations: {
        care_harm: 0.7,
        fairness_cheating: 0.7,
        loyalty_betrayal: 0.5,
        authority_subversion: 0.5,
        sanctity_degradation: 0.5,
        liberty_oppression: 0.6
      },
      social_identity: {
        identity_strength: 0.5,
        ingroup_bias_tendency: 0.3,
        outgroup_bias_tendency: 0.2,
        cultural_intelligence: 0.5,
        system_justification: 0.5
      },
      political_orientation: {
        authoritarian_libertarian: 0.0,
        economic: 0.0,
        cultural_progressive_conservative: 0.0
      },
      worldview_summary: metadata.worldview || "balanced perspective"
    },
    
    memory: {
      persistence: {
        long_term: 0.8,
        short_term: 0.6
      },
      long_term_events: [],
      short_term_slots: 5
    },
    
    state_modifiers: {
      current_state: {
        fatigue: 0.3,
        acute_stress: 0.2,
        mood_valence: 0.6,
        social_safety: 0.7,
        time_pressure: 0.3
      },
      state_to_shift_rules: []
    },
    
    linguistic_style: {
      base_voice: {
        formality: legacy.linguistic_profile?.formality || "casual",
        verbosity: legacy.linguistic_profile?.verbosity || "moderate",
        directness: "balanced",
        politeness: "medium"
      },
      syntax_and_rhythm: {
        complexity: "compound",
        disfluencies: ["um", "uh"],
        signature_phrases: legacy.linguistic_profile?.signature_phrases || [],
        avg_sentence_tokens: { baseline_max: 20, baseline_min: 10 }
      },
      anti_mode_collapse: {
        forbidden_frames: ["At the end of the day", "It's clear that"],
        must_include_one_of: {
          advice: ["suggest", "recommend"],
          opinion: ["perspective", "view"]
        }
      },
      lexical_preferences: {
        hedges: ["I think", "maybe"],
        modal_verbs: ["could", "might"],
        affect_words: { negative_bias: 0.3, positive_bias: 0.6 }
      },
      response_shapes_by_intent: {
        story: ["This reminds me"],
        advice: ["You might consider"],
        opinion: ["From my perspective"]
      }
    },
    
    group_behavior: {
      assertiveness: "medium",
      interruption_tolerance: "medium",
      self_disclosure_rate: "medium"
    },
    
    social_cognition: {
      empathy: "medium",
      theory_of_mind: "medium",
      conflict_orientation: "collaborative"
    },
    
    sexuality_profile: {
      orientation: metadata.sexual_orientation || "heterosexual",
      expression: "private",
      flirtatiousness: "low",
      libido_level: "medium",
      relationship_norms: "monogamous"
    },
    
    emotional_triggers: legacy.emotional_triggers || {
      positive: ["achievement", "recognition"],
      negative: ["criticism", "unfairness"],
      explosive: ["betrayal"]
    },
    
    runtime_controls: {
      style_weights: {
        cognition: 0.4,
        knowledge: 0.2,
        linguistics: 0.3
      },
      token_budgets: { max: 200, min: 50 },
      variability_profile: {
        turn_to_turn: 0.2,
        session_to_session: 0.3
      }
    },
    
    interview_sections: legacy.interview_sections || []
  };
}

function extractLegacyMetadata(v3Data: PersonaV3): any {
  if (!v3Data.identity) return {};
  
  return {
    age: v3Data.identity.age,
    gender: v3Data.identity.gender,
    pronouns: v3Data.identity.pronouns,
    ethnicity: v3Data.identity.ethnicity,
    nationality: v3Data.identity.nationality,
    occupation: v3Data.identity.occupation,
    relationship_status: v3Data.identity.relationship_status,
    location: v3Data.identity.location?.city,
    city: v3Data.identity.location?.city,
    region: v3Data.identity.location?.region,
    country: v3Data.identity.location?.country,
    income_level: v3Data.identity.socioeconomic_context?.income_level,
    education: v3Data.identity.socioeconomic_context?.education_level,
    knowledge_domains: v3Data.knowledge_profile?.knowledge_domains
  };
}

function extractLegacyTraitProfile(v3Data: PersonaV3): any {
  if (!v3Data.cognitive_profile) return {};
  
  return {
    openness: v3Data.cognitive_profile.big_five?.openness,
    neuroticism: v3Data.cognitive_profile.big_five?.neuroticism,
    extraversion: v3Data.cognitive_profile.big_five?.extraversion,
    agreeableness: v3Data.cognitive_profile.big_five?.agreeableness,
    conscientiousness: v3Data.cognitive_profile.big_five?.conscientiousness,
    empathy: v3Data.cognitive_profile.extended_traits?.empathy,
    self_efficacy: v3Data.cognitive_profile.extended_traits?.self_efficacy
  };
}