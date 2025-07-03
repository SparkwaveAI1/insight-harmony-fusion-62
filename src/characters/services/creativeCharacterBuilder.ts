import { CreativeCharacterData, CreativeCharacter, CreativeCharacterTraitProfile } from '../types/creativeCharacterTypes';
import { v4 as uuidv4 } from 'uuid';

export const buildCreativeCharacterFromData = (
  data: CreativeCharacterData,
  characterId: string,
  userId?: string
): CreativeCharacter => {
  console.log('🏗️ Building creative character with core identity:', data.name);

  const trait_profile: CreativeCharacterTraitProfile = {
    // CORE IDENTITY - Process first and prominently
    primary_ability: data.primaryAbility,
    core_purpose: data.corePurpose,
    key_activities: data.keyActivities,
    important_knowledge: data.importantKnowledge,
    
    // Standard fields
    entity_type: data.entityType,
    narrative_domain: data.narrativeDomain,
    functional_role: data.functionalRole,
    description: data.description,
    physical_form: data.physicalForm,
    environment: data.environment,
    communication_method: data.communication,
    surface_triggers: data.surfaceTriggers,
    change_response_style: data.changeResponseStyle,
  };

  const character: CreativeCharacter = {
    character_id: characterId,
    name: data.name,
    character_type: 'fictional',
    creation_source: 'creative',
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    metadata: {},
    behavioral_modulation: {},
    interview_sections: [],
    linguistic_profile: {},
    preinterview_tags: [],
    simulation_directives: {},
    trait_profile: trait_profile,
    is_public: false,
    enhanced_metadata_version: 2,
    user_id: userId,
  };

  console.log('✅ Creative character built with core identity:', {
    ability: data.primaryAbility,
    purpose: data.corePurpose,
    activities: data.keyActivities.length,
    knowledge: data.importantKnowledge.length
  });

  return character;
};
