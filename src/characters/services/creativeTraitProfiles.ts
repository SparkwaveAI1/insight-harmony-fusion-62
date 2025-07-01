
import { CreativeCharacterData } from '../types/characterTraitTypes';

export function buildCreativeTraitProfile(
  formData: CreativeCharacterData,
  aiGeneratedTraits: any
) {
  console.log('🎭 Building unified creative trait profile for:', formData.name);
  
  // Build a flexible trait profile that works for all creative characters
  const baseTraitProfile = {
    // Core creative character traits
    entity_type: formData.entityType,
    narrative_domain: formData.narrativeDomain,
    functional_role: formData.functionalRole,
    
    // Enhanced traits from AI
    personality_traits: aiGeneratedTraits.personality_traits || formData.coreDrives?.join(', ') || 'Creative character traits',
    core_drives: formData.coreDrives || [],
    surface_triggers: formData.surfaceTriggers || [],
    change_response_style: formData.changeResponseStyle || 'integration',
    
    // Physical form and environment
    physical_form: formData.physicalForm,
    environment: formData.environment,
    communication_style: formData.communication,
  };

  // For characters that need specialized traits (previously "non-humanoid")
  if (formData.entityType !== 'humanoid') {
    return {
      ...baseTraitProfile,
      
      // Specialized traits for non-standard entities
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
      
      // Decision model for complex entities
      decision_model: {
        conflict_resolution_style: aiGeneratedTraits.conflict_resolution_style || 'recursive_simulation',
        volatility_tolerance: aiGeneratedTraits.volatility_tolerance || 0.5,
        reprioritization_threshold: aiGeneratedTraits.reprioritization_threshold || 0.7
      },
      
      // Memory and adaptation systems
      memory_architecture: {
        type: aiGeneratedTraits.memory_type || 'distributed',
        salience_tags: formData.coreDrives || []
      },
      
      behavioral_adaptivity: {
        contradiction_resolution_mode: formData.changeResponseStyle || 'integration',
        state_evolution_rate: aiGeneratedTraits.state_evolution_rate || 0.3,
        experience_threshold_for_change: aiGeneratedTraits.experience_threshold_for_change || 0.6
      }
    };
  }
  
  // For standard humanoid creative characters
  return {
    ...baseTraitProfile,
    
    // Standard personality traits
    big_five: aiGeneratedTraits.big_five || {
      openness: 0.7,
      conscientiousness: 0.6,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4
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
