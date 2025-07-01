
import { CreativeCharacterData, Character } from '../types/characterTraitTypes';
import { buildCreativeCharacterMetadata } from './creativeCharacterMetadata';
import { buildCreativeTraitProfile } from './creativeTraitProfiles';

export function buildCreativeCharacter(
  formData: CreativeCharacterData,
  aiGeneratedTraits: any,
  characterId: string,
  currentDate: string,
  userId: string
): Character {
  console.log('🏗️ Building unified creative character:', formData.name);
  
  const metadata = buildCreativeCharacterMetadata(formData, aiGeneratedTraits);
  const trait_profile = buildCreativeTraitProfile(formData, aiGeneratedTraits);
  
  // Determine character_type based on entity type
  const character_type = formData.entityType === 'non_humanoid' ? 'multi_species' : 'fictional';
  
  // Simplified behavioral modulation for creative characters (not psychological)
  const behavioral_modulation = {
    formality: aiGeneratedTraits.behavioral_modulation?.formality || 0.6,
    enthusiasm: aiGeneratedTraits.behavioral_modulation?.enthusiasm || 0.7,
    assertiveness: aiGeneratedTraits.behavioral_modulation?.assertiveness || 0.6,
    empathy: aiGeneratedTraits.behavioral_modulation?.empathy || 0.5,
    patience: aiGeneratedTraits.behavioral_modulation?.patience || 0.6,
  };

  // Simplified linguistic profile for creative characters
  const linguistic_profile = {
    default_output_length: 'medium',
    speech_register: aiGeneratedTraits.communication_style || 'casual',
    regional_influence: formData.environment || 'Universal',
    cultural_speech_patterns: aiGeneratedTraits.cultural_speech_patterns || 'Creative character patterns',
    speaking_style: {
      formal: formData.entityType === 'formal_entity',
      casual: formData.entityType !== 'formal_entity',
      technical: formData.functionalRole?.includes('technical') || false,
      storytelling: true,
    },
    sample_phrasing: aiGeneratedTraits.sample_phrasing || [],
  };

  console.log('✅ Creative character built with creative-specific traits only');

  return {
    character_id: characterId,
    name: formData.name,
    character_type,
    creation_date: currentDate,
    created_at: currentDate,
    creation_source: 'creative',
    user_id: userId,
    metadata,
    behavioral_modulation,
    interview_sections: [],
    linguistic_profile,
    preinterview_tags: [],
    simulation_directives: {},
    trait_profile,
    // Character Lab doesn't use emotional triggers - they're for psychological modeling
    emotional_triggers: undefined,
    is_public: false,
    enhanced_metadata_version: 2,
    // Fields for all character types
    species_type: formData.entityType === 'non_humanoid' ? aiGeneratedTraits.species_type : null,
    form_factor: formData.physicalForm || null,
    origin_universe: formData.narrativeDomain || null,
    age: aiGeneratedTraits.age || null,
    gender: aiGeneratedTraits.gender || null,
    region: formData.environment || null,
    social_class: aiGeneratedTraits.social_class || null,
    physical_appearance: aiGeneratedTraits.physical_appearance || {},
  };
}
