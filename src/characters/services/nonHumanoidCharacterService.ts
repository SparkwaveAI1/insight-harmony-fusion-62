
import { supabase } from '@/integrations/supabase/client';
import { NonHumanoidCharacter, DbNonHumanoidCharacter } from '../types/nonHumanoidTypes';

export const saveNonHumanoidCharacter = async (character: NonHumanoidCharacter): Promise<NonHumanoidCharacter> => {
  console.log('=== SAVING NON-HUMANOID CHARACTER ===');
  console.log('Character data:', {
    character_id: character.character_id,
    name: character.name,
    user_id: character.user_id,
    species_type: character.species_type
  });

  try {
    // Prepare data for database insertion
    const dbCharacter: Omit<DbNonHumanoidCharacter, 'id'> = {
      character_id: character.character_id,
      name: character.name,
      character_type: character.character_type,
      creation_date: character.creation_date,
      created_at: character.created_at,
      user_id: character.user_id,
      metadata: character.metadata,
      behavioral_modulation: character.behavioral_modulation,
      interview_sections: character.interview_sections,
      linguistic_profile: character.linguistic_profile,
      preinterview_tags: character.preinterview_tags,
      simulation_directives: character.simulation_directives,
      trait_profile: character.trait_profile,
      emotional_triggers: character.emotional_triggers,
      prompt: character.prompt,
      is_public: character.is_public,
      profile_image_url: character.profile_image_url,
      enhanced_metadata_version: character.enhanced_metadata_version,
      origin_universe: character.origin_universe,
      species_type: character.species_type,
      form_factor: character.form_factor
    };

    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .insert(dbCharacter)
      .select()
      .single();

    if (error) {
      console.error('Database error saving non-humanoid character:', error);
      throw new Error(`Failed to save non-humanoid character: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from database after saving non-humanoid character');
    }

    console.log('✅ Non-humanoid character saved successfully:', data.character_id);
    return mapDbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in saveNonHumanoidCharacter:', error);
    throw error instanceof Error ? error : new Error('Unknown error saving non-humanoid character');
  }
};

export const getNonHumanoidCharacterById = async (id: string): Promise<NonHumanoidCharacter | null> => {
  console.log('=== FETCHING NON-HUMANOID CHARACTER BY ID ===');
  console.log('ID:', id);

  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching non-humanoid character by ID:', error);
      throw new Error(`Failed to fetch non-humanoid character: ${error.message}`);
    }

    if (!data) {
      console.log('No non-humanoid character found with ID:', id);
      return null;
    }

    console.log('✅ Non-humanoid character fetched by ID:', data.character_id);
    return mapDbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in getNonHumanoidCharacterById:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching non-humanoid character');
  }
};

export const getNonHumanoidCharacterByCharacterId = async (characterId: string): Promise<NonHumanoidCharacter | null> => {
  console.log('=== FETCHING NON-HUMANOID CHARACTER BY CHARACTER_ID ===');
  console.log('Character ID:', characterId);

  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .eq('character_id', characterId)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching non-humanoid character by character_id:', error);
      throw new Error(`Failed to fetch non-humanoid character: ${error.message}`);
    }

    if (!data) {
      console.log('No non-humanoid character found with character_id:', characterId);
      return null;
    }

    console.log('✅ Non-humanoid character fetched by character_id:', data.character_id);
    return mapDbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in getNonHumanoidCharacterByCharacterId:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching non-humanoid character');
  }
};

export const getAllNonHumanoidCharacters = async (): Promise<NonHumanoidCharacter[]> => {
  console.log('=== FETCHING ALL NON-HUMANOID CHARACTERS ===');

  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching non-humanoid characters:', error);
      throw new Error(`Failed to fetch non-humanoid characters: ${error.message}`);
    }

    console.log(`✅ Fetched ${data?.length || 0} non-humanoid characters`);
    return data ? data.map(mapDbCharacterToCharacter) : [];
  } catch (error) {
    console.error('Error in getAllNonHumanoidCharacters:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching non-humanoid characters');
  }
};

export const updateNonHumanoidCharacterVisibility = async (characterId: string, isPublic: boolean): Promise<void> => {
  console.log('=== UPDATING NON-HUMANOID CHARACTER VISIBILITY ===');
  console.log('Character ID:', characterId, 'Public:', isPublic);

  try {
    const { error } = await supabase
      .from('non_humanoid_characters')
      .update({ is_public: isPublic })
      .eq('character_id', characterId);

    if (error) {
      console.error('Database error updating non-humanoid character visibility:', error);
      throw new Error(`Failed to update non-humanoid character visibility: ${error.message}`);
    }

    console.log('✅ Non-humanoid character visibility updated');
  } catch (error) {
    console.error('Error in updateNonHumanoidCharacterVisibility:', error);
    throw error instanceof Error ? error : new Error('Unknown error updating non-humanoid character visibility');
  }
};

export const updateNonHumanoidCharacterName = async (characterId: string, name: string): Promise<void> => {
  console.log('=== UPDATING NON-HUMANOID CHARACTER NAME ===');
  console.log('Character ID:', characterId, 'Name:', name);

  try {
    const { error } = await supabase
      .from('non_humanoid_characters')
      .update({ name })
      .eq('character_id', characterId);

    if (error) {
      console.error('Database error updating non-humanoid character name:', error);
      throw new Error(`Failed to update non-humanoid character name: ${error.message}`);
    }

    console.log('✅ Non-humanoid character name updated');
  } catch (error) {
    console.error('Error in updateNonHumanoidCharacterName:', error);
    throw error instanceof Error ? error : new Error('Unknown error updating non-humanoid character name');
  }
};

export const deleteNonHumanoidCharacter = async (characterId: string): Promise<void> => {
  console.log('=== DELETING NON-HUMANOID CHARACTER ===');
  console.log('Character ID:', characterId);

  try {
    const { error } = await supabase
      .from('non_humanoid_characters')
      .delete()
      .eq('character_id', characterId);

    if (error) {
      console.error('Database error deleting non-humanoid character:', error);
      throw new Error(`Failed to delete non-humanoid character: ${error.message}`);
    }

    console.log('✅ Non-humanoid character deleted');
  } catch (error) {
    console.error('Error in deleteNonHumanoidCharacter:', error);
    throw error instanceof Error ? error : new Error('Unknown error deleting non-humanoid character');
  }
};

// Helper function to map database record to character interface
const mapDbCharacterToCharacter = (dbCharacter: DbNonHumanoidCharacter): NonHumanoidCharacter => {
  return {
    id: dbCharacter.id,
    character_id: dbCharacter.character_id,
    name: dbCharacter.name,
    character_type: dbCharacter.character_type,
    creation_date: dbCharacter.creation_date,
    created_at: dbCharacter.created_at || dbCharacter.creation_date,
    metadata: dbCharacter.metadata,
    behavioral_modulation: dbCharacter.behavioral_modulation,
    interview_sections: dbCharacter.interview_sections,
    linguistic_profile: dbCharacter.linguistic_profile,
    preinterview_tags: dbCharacter.preinterview_tags,
    simulation_directives: dbCharacter.simulation_directives,
    trait_profile: dbCharacter.trait_profile,
    emotional_triggers: dbCharacter.emotional_triggers,
    prompt: dbCharacter.prompt,
    user_id: dbCharacter.user_id,
    is_public: dbCharacter.is_public,
    profile_image_url: dbCharacter.profile_image_url,
    enhanced_metadata_version: dbCharacter.enhanced_metadata_version,
    origin_universe: dbCharacter.origin_universe,
    species_type: dbCharacter.species_type,
    form_factor: dbCharacter.form_factor
  };
};
