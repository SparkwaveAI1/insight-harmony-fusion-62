
import { CreativeCharacterData, CreativeCharacter } from '../types/creativeCharacterTypes';
import { CreativeTraitArchitectureBuilder } from './creativeTraitArchitectureBuilder';
import { v4 as uuidv4 } from 'uuid';

export class CreativeCharacterBuilder {
  static buildCharacter(data: CreativeCharacterData, userId: string): CreativeCharacter {
    const characterId = uuidv4();
    const creationDate = new Date().toISOString();
    
    // Generate the new trait architecture
    const traitArchitecture = CreativeTraitArchitectureBuilder.buildTraitArchitecture(data);
    
    return {
      character_id: characterId,
      name: data.name,
      character_type: data.entityType === 'human' ? 'fictional' : 'multi_species',
      creation_source: 'creative',
      creation_date: creationDate,
      created_at: creationDate,
      user_id: userId,
      
      // Character Lab's enhanced trait profile with new architecture
      trait_profile: {
        entity_type: data.entityType,
        narrative_domain: data.narrativeDomain,
        functional_role: data.functionalRole,
        description: data.description,
        environment: data.environment,
        physical_form: data.physicalForm,
        communication_method: data.communication,
        
        // New Character Lab trait architecture
        core_motives: traitArchitecture.core_motives,
        latent_values: traitArchitecture.latent_values,
        symbolic_traits: traitArchitecture.symbolic_traits,
        cognitive_filters: traitArchitecture.cognitive_filters,
        
        // Legacy Character Lab Core Drives (kept for backward compatibility)
        core_drives: data.coreDrives,
        surface_triggers: data.surfaceTriggers,
        change_response_style: data.changeResponseStyle,
        
        // Creative character specific traits
        creative_personality: {
          imagination_level: 0.7,
          expressiveness: 0.6,
          social_comfort: 0.5,
          collaborative_nature: 0.6,
          emotional_depth: 0.7
        },
        
        decision_approach: {
          conflict_style: data.changeResponseStyle,
          adaptability: 0.6,
          change_threshold: 0.5
        }
      },
      
      // Standard required fields for database compatibility
      metadata: {
        creation_method: 'character_lab',
        version: '4.0',
        module: 'character_lab',
        trait_architecture: 'enhanced_v4'
      },
      
      behavioral_modulation: {
        formality: 0.5,
        enthusiasm: 0.6,
        assertiveness: 0.5,
        empathy: 0.7,
        patience: 0.6
      },
      
      linguistic_profile: {
        default_output_length: 'medium',
        speech_register: 'contextual',
        cultural_speech_patterns: 'entity-appropriate'
      },
      
      interview_sections: [],
      preinterview_tags: [],
      simulation_directives: {
        roleplay_style: 'immersive',
        consistency_level: 'high',
        evolution_enabled: true,
        trait_architecture: 'enhanced_v4'
      },
      
      // NO emotional_triggers field - Character Lab doesn't use them
      
      // Character-specific fields
      species_type: data.entityType === 'human' ? undefined : data.entityType,
      origin_universe: data.narrativeDomain,
      enhanced_metadata_version: 4,
      is_public: false
    };
  }
}
