
import { supabase } from '@/integrations/supabase/client';
import { Collection, CollectionWithPersonaCount } from './types';

/**
 * Add a persona to a collection
 */
export const addPersonaToCollection = async (
  collectionId: string,
  personaId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('collection_personas')
      .insert({ collection_id: collectionId, persona_id: personaId });

    if (error) {
      console.error('Error adding persona to collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding persona to collection:', error);
    return false;
  }
};

/**
 * Add multiple personas to a collection
 */
export const addPersonasToCollection = async (
  collectionId: string,
  personaIds: string[]
): Promise<boolean> => {
  try {
    if (personaIds.length === 0) return true;
    
    const insertData = personaIds.map(personaId => ({
      collection_id: collectionId,
      persona_id: personaId
    }));

    const { error } = await supabase
      .from('collection_personas')
      .insert(insertData);

    if (error) {
      console.error('Error adding personas to collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding personas to collection:', error);
    return false;
  }
};

/**
 * Remove a persona from a collection
 */
export const removePersonaFromCollection = async (
  collectionId: string,
  personaId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('collection_personas')
      .delete()
      .match({ collection_id: collectionId, persona_id: personaId });

    if (error) {
      console.error('Error removing persona from collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing persona from collection:', error);
    return false;
  }
};

/**
 * Check if a persona is in a collection
 */
export const isPersonaInCollection = async (
  collectionId: string,
  personaId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('collection_personas')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('persona_id', personaId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if persona is in collection:', error);
    return false;
  }
};

/**
 * Get all personas in a collection
 */
export const getPersonasInCollection = async (collectionId: string) => {
  try {
    // Get persona IDs in collection
    const { data, error } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (error) {
      console.error('Error getting personas in collection:', error);
      return [];
    }

    return data.map(item => item.persona_id);
  } catch (error) {
    console.error('Error getting personas in collection:', error);
    return [];
  }
};

/**
 * Get all personas not in a collection (includes both legacy and V4 personas)
 */
export const getPersonasNotInCollection = async (collectionId: string, userId: string) => {
  try {
    // Get persona IDs in this collection
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (collectionError) {
      console.error('Error getting personas in collection:', collectionError);
      return [];
    }

    // Extract the persona IDs
    const personaIdsInCollection = collectionPersonas.map(item => item.persona_id);

    // Get all user's personas from personas_union and filter out those in collection
    const { data: userPersonas, error: userPersonasError } = await supabase
      .from('personas_union')
      .select('*')
      .eq('user_id', userId);

    if (userPersonasError) {
      console.error('Error getting user personas:', userPersonasError);
      return [];
    }

    const availablePersonas = userPersonas.filter(persona => 
      !personaIdsInCollection.includes(persona.id)
    );

    // Convert to consistent format
    const convertedPersonas = availablePersonas.map(persona => ({
      id: persona.id,
      persona_id: persona.id,
      name: persona.name,
      description: `V4 Persona - Created on ${new Date(persona.created_at || '').toLocaleDateString()}`,
      user_id: persona.user_id,
      is_public: false,
      created_at: persona.created_at || '',
      updated_at: persona.created_at || '',
      persona_data: {},
      profile_image_url: persona.profile_image_url,
      prompt: null,
      version: 'v4.0'
    }));

    return convertedPersonas;
  } catch (error) {
    console.error('Error getting personas not in collection:', error);
    return [];
  }
};
