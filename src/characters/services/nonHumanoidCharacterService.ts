
import { supabase } from '@/integrations/supabase/client';
import { NonHumanoidCharacter, DbNonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CharacterLinguisticProfile, CharacterBehavioralModulation } from '../types/characterLinguisticTypes';

export const getAllNonHumanoidCharacters = async (): Promise<NonHumanoidCharacter[]> => {
  console.log('🔍 Fetching all non-humanoid characters...');
  
  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching non-humanoid characters:', error);
      throw new Error(`Failed to fetch non-humanoid characters: ${error.message}`);
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} non-humanoid characters`);
    return (data || []).map(dbCharacterToNonHumanoidCharacter);
  } catch (error) {
    console.error('💥 Unexpected error in getAllNonHumanoidCharacters:', error);
    throw error;
  }
};

export const getNonHumanoidCharacterById = async (id: string): Promise<NonHumanoidCharacter | null> => {
  console.log('🔍 Fetching non-humanoid character by ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching non-humanoid character:', error);
      throw new Error(`Failed to fetch non-humanoid character: ${error.message}`);
    }

    if (!data) {
      console.log('📭 No non-humanoid character found with ID:', id);
      return null;
    }

    console.log('✅ Successfully fetched non-humanoid character:', data.name);
    return dbCharacterToNonHumanoidCharacter(data);
  } catch (error) {
    console.error('💥 Unexpected error in getNonHumanoidCharacterById:', error);
    throw error;
  }
};

export const getNonHumanoidCharacterByCharacterId = async (characterId: string): Promise<NonHumanoidCharacter | null> => {
  console.log('🔍 Fetching non-humanoid character by character_id:', characterId);
  
  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .select('*')
      .eq('character_id', characterId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching non-humanoid character:', error);
      throw new Error(`Failed to fetch non-humanoid character: ${error.message}`);
    }

    if (!data) {
      console.log('📭 No non-humanoid character found with character_id:', characterId);
      return null;
    }

    console.log('✅ Successfully fetched non-humanoid character:', data.name);
    return dbCharacterToNonHumanoidCharacter(data);
  } catch (error) {
    console.error('💥 Unexpected error in getNonHumanoidCharacterByCharacterId:', error);
    throw error;
  }
};

export const updateNonHumanoidCharacterVisibility = async (
  id: string, 
  isPublic: boolean
): Promise<NonHumanoidCharacter> => {
  console.log(`🔄 Updating non-humanoid character visibility: ${id} -> ${isPublic ? 'public' : 'private'}`);
  
  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .update({ is_public: isPublic })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating non-humanoid character visibility:', error);
      throw new Error(`Failed to update non-humanoid character visibility: ${error.message}`);
    }

    console.log('✅ Successfully updated non-humanoid character visibility');
    return dbCharacterToNonHumanoidCharacter(data);
  } catch (error) {
    console.error('💥 Unexpected error in updateNonHumanoidCharacterVisibility:', error);
    throw error;
  }
};

export const updateNonHumanoidCharacterName = async (
  id: string, 
  name: string
): Promise<NonHumanoidCharacter> => {
  console.log(`🔄 Updating non-humanoid character name: ${id} -> ${name}`);
  
  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating non-humanoid character name:', error);
      throw new Error(`Failed to update non-humanoid character name: ${error.message}`);
    }

    console.log('✅ Successfully updated non-humanoid character name');
    return dbCharacterToNonHumanoidCharacter(data);
  } catch (error) {
    console.error('💥 Unexpected error in updateNonHumanoidCharacterName:', error);
    throw error;
  }
};

export const updateNonHumanoidCharacterProfileImageUrl = async (
  id: string, 
  profileImageUrl: string
): Promise<NonHumanoidCharacter> => {
  console.log(`🔄 Updating non-humanoid character profile image: ${id}`);
  
  try {
    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .update({ profile_image_url: profileImageUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating non-humanoid character profile image:', error);
      throw new Error(`Failed to update non-humanoid character profile image: ${error.message}`);
    }

    console.log('✅ Successfully updated non-humanoid character profile image');
    return dbCharacterToNonHumanoidCharacter(data);
  } catch (error) {
    console.error('💥 Unexpected error in updateNonHumanoidCharacterProfileImageUrl:', error);
    throw error;
  }
};

export const deleteNonHumanoidCharacter = async (id: string): Promise<void> => {
  console.log('🗑️ Deleting non-humanoid character:', id);
  
  try {
    const { error } = await supabase
      .from('non_humanoid_characters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting non-humanoid character:', error);
      throw new Error(`Failed to delete non-humanoid character: ${error.message}`);
    }

    console.log('✅ Successfully deleted non-humanoid character');
  } catch (error) {
    console.error('💥 Unexpected error in deleteNonHumanoidCharacter:', error);
    throw error;
  }
};

export const cloneNonHumanoidCharacter = async (
  originalId: string, 
  newName: string,
  userId: string
): Promise<NonHumanoidCharacter> => {
  console.log('🔄 Cloning non-humanoid character:', originalId, 'as', newName);
  
  try {
    // First, get the original character
    const original = await getNonHumanoidCharacterById(originalId);
    if (!original) {
      throw new Error('Original non-humanoid character not found');
    }

    // Create a new character based on the original
    const newCharacterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clonedCharacter = {
      character_id: newCharacterId,
      name: newName,
      character_type: 'multi_species' as const,
      creation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      appearance_prompt: original.appearance_prompt,
      metadata: {
        ...original.metadata,
        cloned_from: original.character_id,
        original_name: original.name
      },
      behavioral_modulation: original.behavioral_modulation,
      interview_sections: original.interview_sections,
      linguistic_profile: original.linguistic_profile,
      preinterview_tags: original.preinterview_tags,
      simulation_directives: original.simulation_directives,
      trait_profile: original.trait_profile,
      prompt: original.prompt,
      user_id: userId,
      is_public: false, // Clones are private by default
      profile_image_url: original.profile_image_url,
      enhanced_metadata_version: original.enhanced_metadata_version,
      origin_universe: original.origin_universe,
      species_type: original.species_type,
      form_factor: original.form_factor,
    };

    const { data, error } = await supabase
      .from('non_humanoid_characters')
      .insert({
        ...clonedCharacter,
        // Cast complex objects to Json for database compatibility
        trait_profile: clonedCharacter.trait_profile as any,
        behavioral_modulation: clonedCharacter.behavioral_modulation as any,
        linguistic_profile: clonedCharacter.linguistic_profile as any,
        metadata: clonedCharacter.metadata as any,
        simulation_directives: clonedCharacter.simulation_directives as any,
        interview_sections: clonedCharacter.interview_sections as any,
        preinterview_tags: clonedCharacter.preinterview_tags as any
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error cloning non-humanoid character:', error);
      throw new Error(`Failed to clone non-humanoid character: ${error.message}`);
    }

    console.log('✅ Successfully cloned non-humanoid character');
    return dbCharacterToNonHumanoidCharacter(data);
  } catch (error) {
    console.error('💥 Unexpected error in cloneNonHumanoidCharacter:', error);
    throw error;
  }
};

// Helper function to convert database character to NonHumanoidCharacter
const dbCharacterToNonHumanoidCharacter = (dbCharacter: any): NonHumanoidCharacter => {
  return {
    id: dbCharacter.id,
    character_id: dbCharacter.character_id,
    name: dbCharacter.name,
    character_type: 'multi_species' as const,
    creation_date: dbCharacter.creation_date,
    created_at: dbCharacter.created_at || new Date().toISOString(),
    appearance_prompt: dbCharacter.appearance_prompt,
    metadata: dbCharacter.metadata || {},
    behavioral_modulation: (dbCharacter.behavioral_modulation as CharacterBehavioralModulation) || {
      formality: 0.5,
      enthusiasm: 0.5,
      assertiveness: 0.5,
      empathy: 0.5,
      patience: 0.5
    },
    interview_sections: dbCharacter.interview_sections || [],
    linguistic_profile: (dbCharacter.linguistic_profile as CharacterLinguisticProfile) || {
      communication_style: 'non-verbal',
      vocabulary_complexity: 'complex',
      speech_patterns: ['alien'],
      formality_level: 0.5,
      expressiveness: 0.8,
      cultural_speech_markers: []
    },
    preinterview_tags: dbCharacter.preinterview_tags || [],
    simulation_directives: dbCharacter.simulation_directives || {},
    trait_profile: dbCharacter.trait_profile,
    prompt: dbCharacter.prompt,
    user_id: dbCharacter.user_id,
    is_public: dbCharacter.is_public || false,
    profile_image_url: dbCharacter.profile_image_url,
    enhanced_metadata_version: dbCharacter.enhanced_metadata_version || 1,
    origin_universe: dbCharacter.origin_universe,
    species_type: dbCharacter.species_type,
    form_factor: dbCharacter.form_factor,
  };
};
