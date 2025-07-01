
import { supabase } from '@/integrations/supabase/client';
import { Character, CreativeCharacterData } from '../types/characterTraitTypes';
import { CreativeCharacterBuilder } from './creativeCharacterBuilder';

export async function createCreativeCharacter(
  data: CreativeCharacterData, 
  userId: string
): Promise<Character> {
  console.log('Creating enhanced creative character with data:', data);
  console.log('User ID:', userId);

  try {
    // Build the enhanced character using the new builder
    const character = CreativeCharacterBuilder.buildCharacter(data, userId);

    console.log('Built enhanced character object:', character);

    // Convert to database-compatible format
    const dbCharacter = {
      ...character,
      // Ensure JSON fields are properly serialized
      trait_profile: character.trait_profile as any,
      metadata: character.metadata as any,
      behavioral_modulation: character.behavioral_modulation as any,
      linguistic_profile: character.linguistic_profile as any,
      emotional_triggers: character.emotional_triggers as any
    };

    // Insert into the database
    const { data: insertedData, error } = await supabase
      .from('characters')
      .insert(dbCharacter)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save character: ${error.message}`);
    }

    console.log('Successfully created enhanced creative character:', insertedData);
    
    // Convert back to Character type for return
    return {
      ...insertedData,
      trait_profile: insertedData.trait_profile as any,
      metadata: insertedData.metadata as any,
      behavioral_modulation: insertedData.behavioral_modulation as any,
      linguistic_profile: insertedData.linguistic_profile as any,
      emotional_triggers: insertedData.emotional_triggers as any
    } as Character;

  } catch (error) {
    console.error('Error in createCreativeCharacter:', error);
    throw error;
  }
}

// Enhanced character retrieval with full trait profile support
export async function getCreativeCharacter(characterId: string): Promise<Character | null> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('character_id', characterId)
      .eq('creation_source', 'creative')
      .single();

    if (error) {
      console.error('Error fetching creative character:', error);
      return null;
    }

    // Convert database JSON fields back to proper types
    return {
      ...data,
      trait_profile: data.trait_profile as any,
      metadata: data.metadata as any,
      behavioral_modulation: data.behavioral_modulation as any,
      linguistic_profile: data.linguistic_profile as any,
      emotional_triggers: data.emotional_triggers as any
    } as Character;
  } catch (error) {
    console.error('Error in getCreativeCharacter:', error);
    return null;
  }
}

// Get all creative characters with enhanced trait profiles
export async function getCreativeCharacters(userId: string): Promise<Character[]> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .eq('creation_source', 'creative')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creative characters:', error);
      return [];
    }

    // Convert database JSON fields back to proper types
    return (data || []).map(item => ({
      ...item,
      trait_profile: item.trait_profile as any,
      metadata: item.metadata as any,
      behavioral_modulation: item.behavioral_modulation as any,
      linguistic_profile: item.linguistic_profile as any,
      emotional_triggers: item.emotional_triggers as any
    })) as Character[];
  } catch (error) {
    console.error('Error in getCreativeCharacters:', error);
    return [];
  }
}

// Update character evolution history when traits mutate
export async function updateCharacterEvolution(
  characterId: string,
  trigger: string,
  changes: string[]
): Promise<void> {
  try {
    const character = await getCreativeCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const evolutionModel = character.trait_profile.evolution_model || {
      trait_mutation_history: []
    };

    const newMutation = {
      timestamp: new Date().toISOString(),
      trigger,
      changes
    };

    evolutionModel.trait_mutation_history = [
      ...(evolutionModel.trait_mutation_history || []),
      newMutation
    ].slice(-10); // Keep only last 10 mutations

    const updatedTraitProfile = {
      ...character.trait_profile,
      evolution_model: evolutionModel
    };

    const { error } = await supabase
      .from('characters')
      .update({ trait_profile: updatedTraitProfile as any })
      .eq('character_id', characterId);

    if (error) {
      console.error('Error updating character evolution:', error);
      throw error;
    }

    console.log('Character evolution updated successfully');
  } catch (error) {
    console.error('Error in updateCharacterEvolution:', error);
    throw error;
  }
}
