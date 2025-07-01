
import { CreativeCharacterData, Character } from '../types/characterTraitTypes';
import { TraitProfileBuilder } from './traitProfileBuilder';
import { v4 as uuidv4 } from 'uuid';

export class CreativeCharacterBuilder {
  static buildCharacter(data: CreativeCharacterData, userId: string): Character {
    const characterId = uuidv4();
    const creationDate = new Date().toISOString();
    
    return {
      character_id: characterId,
      name: data.name,
      character_type: data.entityType === 'human' ? 'fictional' : 'multi_species',
      creation_source: 'creative',
      creation_date: creationDate,
      created_at: creationDate,
      user_id: userId,
      
      // Enhanced trait profile with all new systems
      trait_profile: TraitProfileBuilder.buildEnhancedTraitProfile(data),
      
      // Standard required fields with flexible JSON compatibility
      metadata: {
        creation_method: 'enhanced_character_lab',
        version: '2.0',
        enhancement_level: 'full_cognitive_model'
      } as any,
      behavioral_modulation: {
        formality: 0.5,
        enthusiasm: 0.6,
        assertiveness: 0.5,
        empathy: 0.7,
        patience: 0.6
      } as any,
      linguistic_profile: {
        default_output_length: 'medium',
        speech_register: 'contextual',
        cultural_speech_patterns: 'entity-appropriate'
      } as any,
      interview_sections: [],
      preinterview_tags: [],
      simulation_directives: {
        roleplay_style: 'immersive',
        consistency_level: 'high',
        evolution_enabled: true
      },
      
      // Simplified emotional triggers for Character Lab - using simple arrays
      emotional_triggers: {
        positive_triggers: data.coreDrives.map(drive => `Success in ${drive.toLowerCase()}`),
        negative_triggers: data.surfaceTriggers.map(trigger => `Interference with ${trigger.toLowerCase()}`)
      } as any,
      
      // Character-specific fields
      species_type: data.entityType === 'human' ? undefined : data.entityType,
      origin_universe: data.narrativeDomain,
      enhanced_metadata_version: 2,
      is_public: false
    };
  }
}
