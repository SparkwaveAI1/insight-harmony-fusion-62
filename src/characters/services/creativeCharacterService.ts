
import { v4 as uuidv4 } from 'uuid';
import { Character } from '../types/characterTraitTypes';
import { CreativeCharacterData } from '../types/characterTraitTypes';
import { generateNonHumanoidTraits } from './nonHumanoidTraitGenerator';
import { saveCharacter } from './characterService';

export const createCreativeCharacter = async (data: CreativeCharacterData): Promise<Character> => {
  console.log('=== CREATING CREATIVE CHARACTER ===');
  console.log('Creative character data:', data);

  try {
    // Generate non-humanoid traits based on the creative data
    const traitProfile = await generateNonHumanoidTraits({
      name: data.name,
      description: data.description,
      entityType: data.entityType,
      narrativeDomain: data.narrativeDomain,
      functionalRole: data.functionalRole,
      environment: data.environment,
      physicalForm: data.physicalForm,
      communication: data.communication,
      coreDrives: data.coreDrives,
      surfaceTriggers: data.surfaceTriggers,
      changeResponseStyle: data.changeResponseStyle
    });

    // Create the character object
    const character: Character = {
      character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      character_type: 'multi_species',
      creation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      metadata: {
        description: data.description,
        narrative_domain: data.narrativeDomain,
        functional_role: data.functionalRole,
        environment: data.environment,
        communication: data.communication,
        core_drives: data.coreDrives,
        surface_triggers: data.surfaceTriggers,
        change_response_style: data.changeResponseStyle,
        created_via: 'creative_genesis'
      },
      trait_profile: traitProfile,
      behavioral_modulation: {
        formality: 0.5,
        enthusiasm: 0.6,
        assertiveness: 0.5,
        empathy: 0.4,
        patience: 0.7
      },
      linguistic_profile: {
        preferred_language: 'Universal',
        complexity_level: 'Standard',
        communication_patterns: traitProfile.communication_style?.modality || 'Non-verbal'
      },
      interview_sections: [],
      preinterview_tags: [data.entityType, data.narrativeDomain, data.functionalRole],
      simulation_directives: traitProfile.simulation_directives,
      emotional_triggers: {
        positive_triggers: data.coreDrives.map(drive => ({
          trigger: drive,
          intensity: 0.7,
          description: `Responds positively to ${drive.toLowerCase()}`
        })),
        negative_triggers: data.surfaceTriggers.map(trigger => ({
          trigger: trigger,
          intensity: 0.8,
          description: `Becomes agitated by ${trigger.toLowerCase()}`
        }))
      },
      // Non-humanoid specific fields
      origin_universe: data.narrativeDomain,
      species_type: traitProfile.species_type,
      form_factor: traitProfile.form_factor,
      is_public: false,
      enhanced_metadata_version: 2
    };

    // Save the character to the database
    const savedCharacter = await saveCharacter(character);
    
    console.log('✅ Creative character created successfully');
    return savedCharacter;
  } catch (error) {
    console.error('Error creating creative character:', error);
    throw new Error(`Failed to create creative character: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
