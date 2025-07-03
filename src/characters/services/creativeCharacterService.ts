
import { supabase } from '@/integrations/supabase/client';
import { CreativeCharacter, CreativeCharacterData } from '../types/creativeCharacterTypes';
import { CreativeCharacterBuilder } from './creativeCharacterBuilder';
import { dbResultToCreativeCharacter, creativeCharacterToDbFormat } from './creativeCharacterTypeMappers';

export async function createCreativeCharacter(
  data: CreativeCharacterData, 
  userId: string
): Promise<CreativeCharacter> {
  console.log('Creating Character Lab character with data:', data);
  console.log('User ID:', userId);

  try {
    // Build the Character Lab character using the corrected builder
    const character = CreativeCharacterBuilder.buildCharacter(data, userId);

    console.log('Built Character Lab character object:', character);
    console.log('Character user_id:', character.user_id);

    // Convert to database-compatible format
    const dbCharacter = creativeCharacterToDbFormat(character);
    console.log('DB character user_id:', dbCharacter.user_id);

    // Insert into the database using type assertion for compatibility
    const { data: insertedData, error } = await supabase
      .from('characters')
      .insert(dbCharacter as any)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save character: ${error.message}`);
    }

    console.log('Successfully created Character Lab character:', insertedData);
    
    // Convert back to CreativeCharacter type for return
    return dbResultToCreativeCharacter(insertedData);

  } catch (error) {
    console.error('Error in createCreativeCharacter:', error);
    throw error;
  }
}

// Optimized Character Lab character retrieval with full trait profile
export async function getCreativeCharacter(characterId: string): Promise<CreativeCharacter | null> {
  try {
    console.log('🔍 Fetching full character details for:', characterId);
    
    const { data, error } = await supabase
      .from('characters')
      .select('*') // Full character data including complete trait_profile
      .eq('character_id', characterId)
      .eq('creation_source', 'creative')
      .single();

    if (error) {
      console.error('Error fetching creative character:', error);
      return null;
    }

    console.log('✅ Full character details loaded');
    return dbResultToCreativeCharacter(data);
  } catch (error) {
    console.error('Error in getCreativeCharacter:', error);
    return null;
  }
}

// Legacy method - kept for compatibility but now uses optimized approach
export async function getCreativeCharacters(userId: string): Promise<CreativeCharacter[]> {
  try {
    console.log('⚠️ Using legacy getCreativeCharacters - consider using optimized hook instead');
    
    const { data, error } = await supabase
      .from('characters')
      .select(`
        character_id,
        name,
        creation_source,
        created_at,
        user_id,
        is_public,
        profile_image_url,
        trait_profile
      `)
      .eq('user_id', userId)
      .eq('creation_source', 'creative')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to prevent timeouts

    if (error) {
      console.error('Error fetching creative characters:', error);
      return [];
    }

    console.log(`✅ Legacy fetch: ${data?.length || 0} characters`);
    return (data || []).map(dbResultToCreativeCharacter);
  } catch (error) {
    console.error('Error in getCreativeCharacters:', error);
    return [];
  }
}
