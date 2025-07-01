
import { CreativeCharacterData } from '../types/characterTraitTypes';

export function buildCreativeTraitProfile(
  formData: CreativeCharacterData,
  aiGeneratedTraits: any
) {
  console.log('🎭 Building unified creative trait profile for:', formData.name);
  
  // For non-humanoid characters, build specialized trait profile
  if (formData.entityType === 'non_humanoid') {
    return buildNonHumanoidTraitProfile(formData, aiGeneratedTraits);
  }
  
  // For humanoid creative characters, build standard trait profile
  return buildHumanoidCreativeTraitProfile(formData, aiGeneratedTraits);
}

function buildNonHumanoidTraitProfile(formData: CreativeCharacterData, aiGeneratedTraits: any) {
  return {
    // Species and form information
    species_type: aiGeneratedTraits.species_type || formData.entityType,
    form_factor: formData.physicalForm,
    origin_universe: formData.narrativeDomain,
    
    // Physical manifestation traits
    physical_manifestation: {
      primary_form: formData.physicalForm,
      scale_category: aiGeneratedTraits.scale_category || 'Human-scale',
      material_composition: aiGeneratedTraits.material_composition || 'Unknown',
      dimensional_properties: aiGeneratedTraits.dimensional_properties || '3D Stable',
      luminescence_pattern: aiGeneratedTraits.luminescence_pattern || 'None',
      texture_quality: aiGeneratedTraits.texture_quality || 'Varied',
      movement_characteristics: aiGeneratedTraits.movement_characteristics || 'Standard',
      environmental_interaction: aiGeneratedTraits.environmental_interaction || 'Neutral',
      sensory_emanations: aiGeneratedTraits.sensory_emanations || 'None',
      structural_complexity: aiGeneratedTraits.structural_complexity || 'Moderate'
    },
    
    // Communication style
    communication_style: {
      modality: formData.communication,
      linguistic_structure: aiGeneratedTraits.linguistic_structure || 'Standard',
      expression_register: aiGeneratedTraits.expression_register || 'Neutral'
    },
    
    // Core motives from form data
    core_motives: buildCoreMotivesFromDrives(formData.coreDrives),
    
    // Behavioral triggers from surface triggers
    behavioral_triggers: buildBehavioralTriggersFromSurface(formData.surfaceTriggers),
    
    // Institutional recognition
    institutional_recognition: {
      system_mapping_capability: aiGeneratedTraits.system_mapping_capability || 0.5,
      protocol_alignment_drive: aiGeneratedTraits.protocol_alignment_drive || 0.5,
      subversion_potential: aiGeneratedTraits.subversion_potential || 0.3
    },
    
    // Action constraints
    action_constraints: {
      core_directives: formData.coreDrives || [],
      temporal_boundaries: aiGeneratedTraits.temporal_boundaries || null,
      hard_code_taboo: formData.surfaceTriggers || []
    },
    
    // Decision model
    decision_model: {
      conflict_resolution_style: aiGeneratedTraits.conflict_resolution_style || 'recursive_simulation',
      volatility_tolerance: aiGeneratedTraits.volatility_tolerance || 0.5,
      reprioritization_threshold: aiGeneratedTraits.reprioritization_threshold || 0.7
    },
    
    // Memory architecture
    memory_architecture: {
      type: aiGeneratedTraits.memory_type || 'distributed',
      salience_tags: formData.coreDrives || []
    },
    
    // Behavioral adaptivity
    behavioral_adaptivity: {
      contradiction_resolution_mode: formData.changeResponseStyle || 'integration',
      state_evolution_rate: aiGeneratedTraits.state_evolution_rate || 0.3,
      experience_threshold_for_change: aiGeneratedTraits.experience_threshold_for_change || 0.6
    },
    
    // Latent values
    latent_values: buildLatentValuesFromDrives(formData.coreDrives),
    
    // Evolution conditions
    evolution_conditions: {
      mutation_triggers: formData.surfaceTriggers || [],
      emergent_trait_generation: true,
      behavioral_forking: false
    },
    
    // Simulation directives
    simulation_directives: {
      preferred_environment: formData.environment,
      memory_decay_profile: 'slow'
    }
  };
}

function buildHumanoidCreativeTraitProfile(formData: CreativeCharacterData, aiGeneratedTraits: any) {
  return {
    // Big Five personality traits (AI-generated or defaults)
    big_five: aiGeneratedTraits.big_five || {
      openness: 0.7,
      conscientiousness: 0.6,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4
    },
    
    // Moral foundations
    moral_foundations: aiGeneratedTraits.moral_foundations || {
      care: 0.6,
      fairness: 0.6,
      loyalty: 0.5,
      authority: 0.4,
      sanctity: 0.4,
      liberty: 0.7
    },
    
    // World values
    world_values: aiGeneratedTraits.world_values || {
      traditional_vs_secular: 0.3,
      survival_vs_self_expression: 0.7,
      materialist_vs_postmaterialist: 0.6
    },
    
    // Political compass
    political_compass: aiGeneratedTraits.political_compass || {
      economic: 0.5,
      authoritarian_libertarian: 0.6,
      cultural_conservative_progressive: 0.6
    },
    
    // Extended traits
    extended_traits: {
      truth_orientation: aiGeneratedTraits.truth_orientation || 0.7,
      empathy: aiGeneratedTraits.empathy || 0.6,
      self_efficacy: aiGeneratedTraits.self_efficacy || 0.6,
      cognitive_flexibility: aiGeneratedTraits.cognitive_flexibility || 0.7,
      emotional_intensity: aiGeneratedTraits.emotional_intensity || 0.6
    },
    
    // Physical appearance (if applicable)
    physical_appearance: aiGeneratedTraits.physical_appearance || {
      height_build: 'average height and build',
      hair: 'varies',
      eye_color: 'varies',
      skin_tone: 'varies',
      ethnicity: 'creative character'
    }
  };
}

function buildCoreMotivesFromDrives(drives: string[] = []): any {
  const motives: any = {};
  drives.forEach(drive => {
    const normalizedDrive = drive.toLowerCase().replace(/\s+/g, '_');
    motives[normalizedDrive] = 0.8;
  });
  return motives;
}

function buildBehavioralTriggersFromSurface(triggers: string[] = []): any {
  const behavioralTriggers: any = {};
  triggers.forEach(trigger => {
    const normalizedTrigger = trigger.toLowerCase().replace(/\s+/g, '_');
    behavioralTriggers[normalizedTrigger] = 0.7;
  });
  return behavioralTriggers;
}

function buildLatentValuesFromDrives(drives: string[] = []): any {
  const values: any = {};
  drives.forEach(drive => {
    const normalizedDrive = `preserve_${drive.toLowerCase().replace(/\s+/g, '_')}`;
    values[normalizedDrive] = 0.7;
  });
  return values;
}
