import { supabase } from '@/integrations/supabase/client';
import { NonHumanoidCharacter, NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';

// Database representation with proper Json typing
interface DbNonHumanoidCharacterInsert {
  character_id: string;
  name: string;
  character_type: 'multi_species';
  creation_date: string;
  created_at: string;
  user_id: string;
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: any; // Use any for Json serialization
  emotional_triggers?: any;
  prompt?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
  origin_universe?: string;
  species_type: string;
  form_factor?: string;
}

export const saveNonHumanoidCharacter = async (character: NonHumanoidCharacter): Promise<NonHumanoidCharacter> => {
  console.log('=== SAVING NON-HUMANOID CHARACTER ===');
  console.log('Character data:', {
    character_id: character.character_id,
    name: character.name,
    user_id: character.user_id,
    species_type: character.species_type
  });

  try {
    // Prepare data for database insertion with proper type conversion
    const dbCharacter: DbNonHumanoidCharacterInsert = {
      character_id: character.character_id,
      name: character.name,
      character_type: 'multi_species' as const,
      creation_date: character.creation_date,
      created_at: character.created_at,
      user_id: character.user_id!,
      metadata: character.metadata,
      behavioral_modulation: character.behavioral_modulation,
      interview_sections: character.interview_sections,
      linguistic_profile: character.linguistic_profile,
      preinterview_tags: character.preinterview_tags,
      simulation_directives: character.simulation_directives,
      trait_profile: character.trait_profile, // This will be serialized as Json
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
    return mapDbRowToCharacter(data);
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
    return await mapDbRowToCharacterWithImageFallback(data);
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
    return await mapDbRowToCharacterWithImageFallback(data);
  } catch (error) {
    console.error('Error in getNonHumanoidCharacterByCharacterId:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching non-humanoid character');
  }
};

export const getAllNonHumanoidCharacters = async (): Promise<NonHumanoidCharacter[]> => {
  console.log('=== FETCHING ALL NON-HUMANOID CHARACTERS ===');

  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user, returning empty array');
      return [];
    }

    console.log('Fetching characters for user:', user.id);

    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching non-humanoid characters:', error);
      throw new Error(`Failed to fetch non-humanoid characters: ${error.message}`);
    }

    console.log(`✅ Fetched ${data?.length || 0} non-humanoid characters`);
    
    // Map all characters with image fallback
    const mappedCharacters = await Promise.all(
      (data || []).map(dbRow => mapDbRowToCharacterWithImageFallback(dbRow))
    );
    
    return mappedCharacters;
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

// Helper function to get image URL from regular characters table
const getImageUrlFromRegularCharacter = async (characterId: string): Promise<string | null> => {
  try {
    console.log('Getting image URL from regular characters table for:', characterId);
    
    const { data, error } = await supabase
      .from('characters')
      .select('profile_image_url')
      .eq('character_id', characterId)
      .maybeSingle();
      
    if (error) {
      console.log('Error checking regular characters table:', error);
      return null;
    }
    
    if (data?.profile_image_url) {
      console.log('Found image URL in regular characters table:', data.profile_image_url);
      return data.profile_image_url;
    }
    
    console.log('No image URL found in regular characters table');
    return null;
  } catch (error) {
    console.error('Error getting image URL from regular character:', error);
    return null;
  }
};

// Enhanced mapper function that gets image URL from regular characters table
const mapDbRowToCharacterWithImageFallback = async (dbRow: any): Promise<NonHumanoidCharacter> => {
  // Always check regular characters table for the image URL since that's where images are stored
  const profileImageUrl = await getImageUrlFromRegularCharacter(dbRow.character_id);

  return {
    id: dbRow.id,
    character_id: dbRow.character_id,
    name: dbRow.name,
    character_type: 'multi_species' as const,
    creation_date: dbRow.creation_date,
    created_at: dbRow.created_at || dbRow.creation_date,
    metadata: dbRow.metadata || {},
    behavioral_modulation: dbRow.behavioral_modulation || {},
    interview_sections: dbRow.interview_sections || [],
    linguistic_profile: dbRow.linguistic_profile || {},
    preinterview_tags: dbRow.preinterview_tags || [],
    simulation_directives: dbRow.simulation_directives || {},
    trait_profile: dbRow.trait_profile as NonHumanoidTraitProfile,
    emotional_triggers: dbRow.emotional_triggers,
    prompt: dbRow.prompt,
    user_id: dbRow.user_id,
    is_public: dbRow.is_public,
    profile_image_url: profileImageUrl, // Always get from regular characters table
    enhanced_metadata_version: dbRow.enhanced_metadata_version,
    origin_universe: dbRow.origin_universe,
    species_type: dbRow.species_type,
    form_factor: dbRow.form_factor
  };
};

// Helper function to map database row to character interface with proper type handling
const mapDbRowToCharacter = (dbRow: any): NonHumanoidCharacter => {
  return {
    id: dbRow.id,
    character_id: dbRow.character_id,
    name: dbRow.name,
    character_type: 'multi_species' as const,
    creation_date: dbRow.creation_date,
    created_at: dbRow.created_at || dbRow.creation_date,
    metadata: dbRow.metadata || {},
    behavioral_modulation: dbRow.behavioral_modulation || {},
    interview_sections: dbRow.interview_sections || [],
    linguistic_profile: dbRow.linguistic_profile || {},
    preinterview_tags: dbRow.preinterview_tags || [],
    simulation_directives: dbRow.simulation_directives || {},
    trait_profile: dbRow.trait_profile as NonHumanoidTraitProfile,
    emotional_triggers: dbRow.emotional_triggers,
    prompt: dbRow.prompt,
    user_id: dbRow.user_id,
    is_public: dbRow.is_public,
    profile_image_url: dbRow.profile_image_url,
    enhanced_metadata_version: dbRow.enhanced_metadata_version,
    origin_universe: dbRow.origin_universe,
    species_type: dbRow.species_type,
    form_factor: dbRow.form_factor
  };
};
