
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
  
  // Enhanced behavioral modulation for creative characters
  const behavioral_modulation = {
    formality: aiGeneratedTraits.behavioral_modulation?.formality || 0.6,
    enthusiasm: aiGeneratedTraits.behavioral_modulation?.enthusiasm || 0.7,
    assertiveness: aiGeneratedTraits.behavioral_modulation?.assertiveness || 0.6,
    empathy: aiGeneratedTraits.behavioral_modulation?.empathy || 0.5,
    patience: aiGeneratedTraits.behavioral_modulation?.patience || 0.6,
  };

  // Linguistic profile adapted for creative characters
  const linguistic_profile = {
    default_output_length: 'medium',
    speech_register: aiGeneratedTraits.communication_style || 'casual',
    regional_influence: formData.environment || 'Universal',
    professional_or_educational_influence: null,
    cultural_speech_patterns: aiGeneratedTraits.cultural_speech_patterns || 'Creative character patterns',
    generational_or_peer_influence: null,
    speaking_style: {
      formal: formData.entityType === 'formal_entity',
      casual: formData.entityType !== 'formal_entity',
      technical: formData.functionalRole?.includes('technical') || false,
      storytelling: true,
    },
    sample_phrasing: aiGeneratedTraits.sample_phrasing || [],
  };

  // Build emotional triggers from core drives and surface triggers
  const emotional_triggers = {
    positive_triggers: (formData.coreDrives || []).map(drive => ({
      keywords: [drive.toLowerCase()],
      emotion_type: 'accomplishment',
      intensity_multiplier: 1.2,
      description: `Triggered by ${drive}`
    })),
    negative_triggers: (formData.surfaceTriggers || []).map(trigger => ({
      keywords: [trigger.toLowerCase()],
      emotion_type: 'frustration',
      intensity_multiplier: 1.1,
      description: `Negatively triggered by ${trigger}`
    }))
  };

  console.log('✅ Creative character built with appropriate creative traits');

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
    emotional_triggers,
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
