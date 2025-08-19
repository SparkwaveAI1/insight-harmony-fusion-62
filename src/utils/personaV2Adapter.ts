import { DbPersonaV2 } from '@/services/persona/types/persona-v2-db';
import { Persona } from '@/services/persona/types';

// Helper function to convert string levels to numbers for trait compatibility
function convertLevelToNumber(level?: string): number {
  switch (level) {
    case 'low': return 3;
    case 'medium': return 5;
    case 'high': return 7;
    default: return 5;
  }
}

/**
 * Temporary adapter to convert V2 personas to V1 format for legacy components
 * This should be removed once all components are migrated to V2
 */
export function adaptV2ToV1Persona(v2Persona: DbPersonaV2): Persona {
  const personaData = v2Persona.persona_data;
  
  // Map V2 persona_data to V1 metadata structure
  const metadata = personaData ? {
    // Core Demographics
    age: personaData.identity?.age?.toString() || '',
    gender: personaData.identity?.gender || '',
    race_ethnicity: personaData.identity?.ethnicity || '',
    sexual_orientation: personaData.sexuality_profile?.orientation || '',
    occupation: personaData.identity?.occupation || '',
    marital_status: personaData.identity?.relationship_status || '',
    
    // Location
    region: personaData.identity?.location?.region || '',
    location_history: {
      current_residence: personaData.identity?.location?.city || '',
      places_lived: [personaData.identity?.location?.city || '']
    },
    
    // Family relationships
    relationships_family: {
      has_children: (personaData.identity?.dependents || 0) > 0,
      number_of_children: personaData.identity?.dependents || 0,
      family_stressors: personaData.life_context?.stressors || [],
      support_system_strength: personaData.life_context?.supports?.length ? 'strong' : 'weak'
    },
    
    // Health and wellness
    health_wellness: {
      mental_health_conditions: personaData.health_profile?.mental_health || [],
      physical_health_status: personaData.health_profile?.physical_health || [],
      substance_use: (personaData.health_profile?.substance_use || []).join(', '),
      energy_level: personaData.health_profile?.energy_baseline || ''
    },
    
    // Knowledge domains
    knowledge_domains: personaData.knowledge_profile?.domains_of_expertise?.reduce((acc: any, domain: string) => {
      acc[domain] = 5; // Default expertise level
      return acc;
    }, {}) || {}
  } : {};

  // Map V2 cognitive_profile to V1 trait_profile structure
  const trait_profile = personaData ? {
    // Big Five from cognitive profile
    base_traits: {
      big_five: personaData.cognitive_profile?.big_five || {},
      moral_foundations: personaData.cognitive_profile?.moral_foundations || {},
      decision_style: personaData.cognitive_profile?.decision_style,
      temporal_orientation: personaData.cognitive_profile?.temporal_orientation,
      worldview_summary: personaData.cognitive_profile?.worldview_summary
    },
    
    // Extended traits from various profiles - convert string levels to numbers
    extended_traits: {
      empathy: convertLevelToNumber(personaData.social_cognition?.empathy),
      theory_of_mind: convertLevelToNumber(personaData.social_cognition?.theory_of_mind),
      trust_baseline: convertLevelToNumber(personaData.social_cognition?.trust_baseline),
      conflict_orientation: personaData.social_cognition?.conflict_orientation || '',
      persuasion_style: personaData.social_cognition?.persuasion_style || '',
      attachment_style: personaData.social_cognition?.attachment_style || '',
      intelligence_level: personaData.cognitive_profile?.intelligence?.level || '',
      intelligence_type: personaData.cognitive_profile?.intelligence?.type || []
    },
    
    // Dynamic state modifiers
    dynamic_state_modifiers: {
      stress_level: 0.5, // Default value
      emotional_stability: personaData.cognitive_profile?.big_five?.neuroticism ? 
        (10 - personaData.cognitive_profile.big_five.neuroticism) / 10 : 0.5,
      fatigue_level: personaData.health_profile?.energy_baseline === 'low' ? 0.7 : 
        personaData.health_profile?.energy_baseline === 'high' ? 0.3 : 0.5
    }
  } : {};

  // Map emotional triggers from persona data
  const emotional_triggers = personaData?.emotional_triggers ? {
    positive_triggers: personaData.emotional_triggers.positive || [],
    negative_triggers: personaData.emotional_triggers.negative || []
  } : {};

  // Map interview sections from persona data - create from memory events  
  const interview_sections = personaData?.memory?.long_term_events?.map(event => ({
    section: 'Life Experience',
    notes: 'Generated from V2 memory data',
    questions: [{
      question: 'Tell me about a significant event in your life',
      response: event.event
    }]
  })) || [];

  // Map linguistic profile from persona data
  const linguistic_profile = personaData ? {
    default_output_length: personaData.linguistic_style?.base_voice?.verbosity || 'moderate',
    speech_register: personaData.linguistic_style?.base_voice?.formality || 'neutral',
    speaking_style: {
      formal: personaData.linguistic_style?.base_voice?.formality === 'formal',
      casual: personaData.linguistic_style?.base_voice?.formality === 'casual',
      direct: personaData.linguistic_style?.base_voice?.directness === 'direct',
      polite: personaData.linguistic_style?.base_voice?.politeness === 'high'
    },
    sample_phrasing: personaData.linguistic_style?.lexical_preferences?.intensifiers || []
  } : {};

  return {
    persona_id: v2Persona.persona_id,
    id: v2Persona.id,
    name: v2Persona.name,
    creation_date: v2Persona.created_at,
    created_at: v2Persona.created_at,
    user_id: v2Persona.user_id,
    is_public: v2Persona.is_public,
    profile_image_url: v2Persona.profile_image_url,
    description: v2Persona.description || '',
    persona_type: v2Persona.persona_type,
    persona_context: v2Persona.description || '',
    
    // Map rich V2 data to V1 structure
    metadata,
    trait_profile,
    emotional_triggers,
    interview_sections,
    linguistic_profile,
    
    // V1 fields with defaults
    behavioral_modulation: {},
    simulation_directives: {},
    preinterview_tags: [],
    prompt: v2Persona.description || '',
    enhanced_metadata_version: null,
    voicepack_runtime: v2Persona.voicepack_runtime
  };
}

/**
 * Adapter to convert V1 persona back to V2 after updates
 * This maintains V2 structure while preserving V1 updates
 */
export function adaptV1ToV2Persona(v1Persona: Persona, originalV2: DbPersonaV2): DbPersonaV2 {
  return {
    ...originalV2,
    name: v1Persona.name,
    description: v1Persona.description || v1Persona.persona_context,
    is_public: v1Persona.is_public,
    profile_image_url: v1Persona.profile_image_url,
    updated_at: new Date().toISOString()
  };
}