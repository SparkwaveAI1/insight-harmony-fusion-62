
import { supabase } from '@/integrations/supabase/client';
import { Collection, CollectionWithPersonaCount } from './types';
import { getV4Personas } from '@/services/v4-persona/getV4Personas';
import { V4Persona } from '@/types/persona-v4';

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
      .select('id')
      .eq('collection_id', collectionId)
      .eq('persona_id', personaId)
      .limit(1);

    if (error) {
      console.error('Error checking if persona is in collection:', error);
      return false;
    }

    return data && data.length > 0;
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
 * Get all personas in a collection with their full details
 */
export const getPersonasInCollectionWithDetails = async (collectionId: string): Promise<V4Persona[]> => {
  try {
    // First get the persona IDs in the collection
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (collectionError) {
      console.error('Error getting persona IDs from collection:', collectionError);
      return [];
    }

    if (!collectionPersonas || collectionPersonas.length === 0) {
      return [];
    }

    const personaIds = collectionPersonas.map(cp => cp.persona_id);

    // Now get the full persona details for those IDs
    const { data: v4Personas, error: personasError } = await supabase
      .from('v4_personas')
      .select('*')
      .in('persona_id', personaIds)
      .eq('creation_completed', true);

    if (personasError) {
      console.error('Error getting v4_personas details:', personasError);
      return [];
    }

    // Transform the data to match the V4Persona format
    return (v4Personas || []).map(v4Persona => {
      const fullProfile = v4Persona.full_profile || {};
      const demographics = typeof fullProfile === 'object' && fullProfile !== null 
        ? (fullProfile as any).demographics || {} 
        : {};
      
      return {
        id: v4Persona.id,
        persona_id: v4Persona.persona_id,
        name: v4Persona.name,
        user_id: v4Persona.user_id,
        schema_version: v4Persona.schema_version || 'v4.0',
        full_profile: v4Persona.full_profile as any,
        conversation_summary: v4Persona.conversation_summary as any,
        creation_stage: v4Persona.creation_stage || 'completed',
        creation_completed: v4Persona.creation_completed,
        created_at: v4Persona.created_at,
        updated_at: v4Persona.updated_at,
        is_public: v4Persona.is_public,
        profile_image_url: v4Persona.profile_image_url,
        metadata: demographics
      } as V4Persona;
    });
  } catch (error) {
    console.error('Error getting personas in collection with details:', error);
    return [];
  }
};

/**
 * Get all personas not in a collection (includes both legacy and V4 personas)
 */
export const getPersonasNotInCollection = async (collectionId: string, userId: string) => {
  try {
    // First, get all persona IDs in the collection
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (collectionError) {
      console.error('Error getting personas in collection:', collectionError);
      return [];
    }

    // Extract just the persona IDs
    const personaIdsInCollection = collectionPersonas.map(item => item.persona_id);

    // No more legacy personas - they have all been migrated to V4
    const legacyPersonas: any[] = [];

    // Get V4 personas and filter out those in collection
    const v4Personas = await getV4Personas(userId);
    const availableV4Personas = v4Personas.filter(persona => 
      !personaIdsInCollection.includes(persona.persona_id)
    );

    // Convert V4 personas to legacy format for consistency
    const convertedV4Personas = availableV4Personas.map(v4Persona => ({
      id: v4Persona.id,
      persona_id: v4Persona.persona_id,
      name: v4Persona.name,
      description: `V4 Persona - Created on ${new Date(v4Persona.created_at || '').toLocaleDateString()}`,
      user_id: v4Persona.user_id,
      is_public: false,
      created_at: v4Persona.created_at || '',
      updated_at: v4Persona.updated_at || '',
      persona_data: {},
      profile_image_url: v4Persona.profile_image_url,
      prompt: null,
      version: 'v4.0'
    }));

    // Combine legacy and V4 personas
    const allAvailablePersonas = [
      ...(legacyPersonas || []),
      ...convertedV4Personas
    ];

    return allAvailablePersonas;
  } catch (error) {
    console.error('Error getting personas not in collection:', error);
    return [];
  }
};
