
import { CreativeCharacterData } from '../types/characterTraitTypes';

export function buildCreativeTraitProfile(
  formData: CreativeCharacterData,
  aiGeneratedTraits: any
) {
  console.log('🎭 Building creative trait profile for:', formData.name);
  
  // Build a flexible trait profile for creative characters
  const baseTraitProfile = {
    // Core creative character identity
    entity_type: formData.entityType,
    narrative_domain: formData.narrativeDomain,
    functional_role: formData.functionalRole,
    description: formData.description,
    
    // Creative character traits (not psychological models)
    personality_summary: aiGeneratedTraits.personality_traits || formData.coreDrives?.join(', ') || 'Creative character traits',
    core_drives: formData.coreDrives || [],
    surface_triggers: formData.surfaceTriggers || [],
    change_response_style: formData.changeResponseStyle || 'integration',
    
    // Physical form and environment
    physical_form: formData.physicalForm,
    environment: formData.environment,
    communication_method: formData.communication,
    
    // Enhanced creative details
    background_story: aiGeneratedTraits.backstory || `A ${formData.entityType} character in ${formData.narrativeDomain}`,
    unique_abilities: aiGeneratedTraits.unique_abilities || [],
    cultural_background: aiGeneratedTraits.cultural_context || formData.narrativeDomain,
  };

  // For non-standard entities, add specialized creative traits
  if (formData.entityType !== 'humanoid') {
    return {
      ...baseTraitProfile,
      
      // Creative entity-specific traits
      manifestation_type: aiGeneratedTraits.species_type || formData.entityType,
      primary_form: formData.physicalForm,
      narrative_universe: formData.narrativeDomain,
      
      // Creative physical traits (not scientific)
      creative_manifestation: {
        primary_appearance: formData.physicalForm,
        scale_reference: aiGeneratedTraits.scale_category || 'Human-scale',
        material_nature: aiGeneratedTraits.material_composition || 'Varies',
        dimensional_type: aiGeneratedTraits.dimensional_properties || 'Standard reality',
        visual_effects: aiGeneratedTraits.luminescence_pattern || 'None',
        texture_description: aiGeneratedTraits.texture_quality || 'Varied',
        movement_style: aiGeneratedTraits.movement_characteristics || 'Natural',
        environmental_relationship: aiGeneratedTraits.environmental_interaction || 'Harmonious',
        presence_aura: aiGeneratedTraits.sensory_emanations || 'Neutral',
        complexity_level: aiGeneratedTraits.structural_complexity || 'Moderate'
      },
      
      // Creative decision patterns (not psychological)
      decision_approach: {
        conflict_style: aiGeneratedTraits.conflict_resolution_style || 'creative_problem_solving',
        adaptability: aiGeneratedTraits.volatility_tolerance || 0.5,
        change_threshold: aiGeneratedTraits.reprioritization_threshold || 0.7
      },
      
      // Creative memory and growth
      experience_processing: {
        type: aiGeneratedTraits.memory_type || 'narrative_based',
        key_themes: formData.coreDrives || []
      },
      
      creative_evolution: {
        adaptation_style: formData.changeResponseStyle || 'integration',
        growth_rate: aiGeneratedTraits.state_evolution_rate || 0.3,
        transformation_trigger: aiGeneratedTraits.experience_threshold_for_change || 0.6
      }
    };
  }
  
  // For humanoid creative characters
  return {
    ...baseTraitProfile,
    
    // Creative personality (not Big Five)
    creative_personality: {
      imagination_level: 0.8,
      expressiveness: 0.7,
      social_comfort: 0.6,
      collaborative_nature: 0.6,
      emotional_depth: 0.5
    },
    
    // Physical appearance for humanoid creatives
    physical_description: aiGeneratedTraits.physical_appearance || {
      height_category: 'average height',
      build_type: 'average build',
      hair_description: 'varies',
      eye_description: 'expressive eyes',
      skin_description: 'varies',
      overall_appearance: 'creative character'
    }
  };
}
