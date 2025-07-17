
import { CreativeCharacterData } from '../types/characterTraitTypes';

export function buildCreativeCharacterMetadata(
  formData: CreativeCharacterData,
  aiGeneratedTraits: any
) {
  console.log('🏗️ Building creative character metadata for:', formData.name);
  
  return {
    // Core creative character information
    name: formData.name,
    entity_type: formData.entityType,
    narrative_domain: formData.narrativeDomain,
    functional_role: formData.functionalRole,
    description: formData.description,
    environment: formData.environment,
    physical_form: formData.physicalForm,
    communication_style: formData.communication,
    core_drives: formData.coreDrives,
    surface_triggers: formData.surfaceTriggers,
    change_response_style: formData.changeResponseStyle,
    
    // AI-generated enhancements
    age: aiGeneratedTraits.age || null,
    gender: aiGeneratedTraits.gender || null,
    race_ethnicity: aiGeneratedTraits.race_ethnicity || aiGeneratedTraits.ethnicity || null,
    occupation: aiGeneratedTraits.occupation || formData.functionalRole,
    social_class_identity: aiGeneratedTraits.social_class || null,
    region: formData.environment,
    cultural_context: aiGeneratedTraits.cultural_context || formData.narrativeDomain,
    
    // Enhanced details from AI
    backstory: aiGeneratedTraits.backstory || `A ${formData.entityType} character in ${formData.narrativeDomain}`,
    personality_traits: aiGeneratedTraits.personality_traits || formData.coreDrives?.join(', ') || 'Creative character traits',
    appearance: aiGeneratedTraits.appearance || formData.physicalForm,
    
    // Physical characteristics (if applicable)
    height: aiGeneratedTraits.physical_appearance?.height || null,
    build_body_type: aiGeneratedTraits.physical_appearance?.build || null,
    hair_color: aiGeneratedTraits.physical_appearance?.hair_color || null,
    eye_color: aiGeneratedTraits.physical_appearance?.eye_color || null,
    skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || null,
    
    // Character creation metadata
    creation_method: 'guided_creative_process',
    creation_version: '2.0_unified',
    original_form_data: formData,
  };
}
