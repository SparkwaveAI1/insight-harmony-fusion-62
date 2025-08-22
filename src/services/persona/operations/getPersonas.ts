
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { dbPersonaToPersona } from "../mappers";

export async function getPersonaById(id: string): Promise<Persona | null> {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? dbPersonaToPersona(data) : null;
  } catch (error) {
    console.error("Error getting persona by ID:", error);
    return null;
  }
}

export async function getPersonaByPersonaId(personaId: string): Promise<Persona | null> {
  try {
    console.log(`Fetching persona with ID ${personaId} from Supabase`);
    
    if (!personaId) {
      console.error('Invalid persona ID: empty string');
      return null;
    }
    
    // For V4 personas (identified by v4_ prefix), fetch from V4 table first
    if (personaId.startsWith('v4_')) {
      console.log(`V4 persona detected (${personaId}), fetching from v4_personas table`);
      
      const { data: v4Data, error: v4Error } = await supabase
        .from('v4_personas')
        .select('*')
        .eq('persona_id', personaId)
        .maybeSingle();

      if (v4Error) {
        console.error(`Error fetching V4 persona with ID ${personaId}:`, v4Error);
        return null;
      }

      if (v4Data) {
        console.log('V4 persona found:', v4Data);
        
        // Convert V4 persona to regular persona format with full data preserved
        const conversationSummary = v4Data.conversation_summary as any;
        const demographics = conversationSummary?.demographics;
        const backgroundDescription = demographics?.background_description;
        
        const convertedPersona = {
          id: v4Data.id,
          persona_id: v4Data.persona_id,
          name: v4Data.name,
          description: backgroundDescription || `${v4Data.name} - V4 Enhanced Persona`,
          user_id: v4Data.user_id,
          is_public: false, // V4 personas default to private for now
          created_at: v4Data.created_at,
          updated_at: v4Data.updated_at,
          persona_data: v4Data.full_profile,
          profile_image_url: null,
          prompt: `V4 Enhanced Persona: ${v4Data.name}`,
          version: v4Data.schema_version || 'v4.0',
          // Preserve V4 specific data for V4PersonaDisplay component
          full_profile: v4Data.full_profile,
          conversation_summary: v4Data.conversation_summary
        };
        
        return convertedPersona;
      }
      
      console.log(`No V4 persona found with ID ${personaId}`);
      return null;
    }
    
    // For non-V4 personas, try the regular personas table
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching persona with ID ${personaId}:`, error);
      return null;
    }

    if (data) {
      console.log('Regular persona found:', data);
      try {
        return dbPersonaToPersona(data);
      } catch (parseError) {
        console.error('Error parsing persona data:', parseError);
        return null;
      }
    }
    
    console.log(`No persona found with ID ${personaId}`);
    return null;
  } catch (error) {
    console.error("Error getting persona by persona_id:", error);
    return null;
  }
}

// Lightweight version for listing personas (without heavy metadata)
export async function getPersonasForListing(): Promise<Persona[]> {
  try {
    console.log("Fetching personas for listing from Supabase");
    const { data, error } = await supabase
      .from('personas')
      .select('id, persona_id, name, description, user_id, is_public, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching personas for listing:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} personas for listing`);
    return data ? data.map(item => ({
      id: item.id,
      persona_id: item.persona_id,
      name: item.name,
      description: item.description || `Created on ${new Date(item.created_at).toLocaleDateString()}`,
      user_id: item.user_id,
      is_public: item.is_public,
      created_at: item.created_at,
      updated_at: item.created_at,
      // Placeholder values for required fields
      metadata: {},
      trait_profile: {},
      behavioral_modulation: {},
      linguistic_profile: {},
      emotional_triggers: null,
      preinterview_tags: [],
      simulation_directives: {},
      interview_sections: [],
      prompt: null
    } as Persona)) : [];
  } catch (error) {
    console.error("Error getting personas for listing:", error);
    return [];
  }
}

export async function getAllPersonas(): Promise<Persona[]> {
  try {
    console.log("Fetching all personas from Supabase");
    
    // Fetch regular personas
    const { data: regularPersonas, error: regularError } = await supabase
      .from('personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (regularError) {
      console.error("Error fetching regular personas:", regularError);
      throw regularError;
    }

    // Fetch V4 personas
    const { data: v4Personas, error: v4Error } = await supabase
      .from('v4_personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (v4Error) {
      console.error("Error fetching V4 personas:", v4Error);
      // Don't throw error for V4 personas, just log and continue
      console.warn("Continuing without V4 personas");
    }

    // Convert regular personas
    const convertedRegularPersonas = regularPersonas ? regularPersonas.map(dbPersonaToPersona) : [];
    
    // Convert V4 personas to regular persona format
    const convertedV4Personas = v4Personas ? v4Personas.map(v4Persona => {
      // Safely access conversation_summary
      const conversationSummary = v4Persona.conversation_summary as any;
      const demographics = conversationSummary?.demographics;
      const backgroundDescription = demographics?.background_description;
      
      return {
        id: v4Persona.id,
        persona_id: v4Persona.persona_id,
        name: v4Persona.name,
        description: backgroundDescription || `${v4Persona.name} - V4 Enhanced Persona`,
        user_id: v4Persona.user_id,
        is_public: false, // V4 personas default to private for now
        created_at: v4Persona.created_at,
        updated_at: v4Persona.updated_at,
        persona_data: v4Persona.full_profile,
        profile_image_url: null,
        prompt: `V4 Enhanced Persona: ${v4Persona.name}`,
        version: v4Persona.schema_version || 'v4.0'
      };
    }) : [];

    // Combine and sort by creation date
    const allPersonas = [...convertedRegularPersonas, ...convertedV4Personas]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log(`Retrieved ${convertedRegularPersonas.length} regular personas and ${convertedV4Personas.length} V4 personas`);
    console.log(`Total personas: ${allPersonas.length}`);
    
    return allPersonas;
  } catch (error) {
    console.error("Error getting all personas:", error);
    return [];
  }
}

// Lightweight version for collection personas
export async function getPersonasByCollectionForListing(collectionId: string): Promise<Persona[]> {
  try {
    // First get the persona_ids from the collection_personas table
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (collectionError) throw collectionError;
    
    if (!collectionPersonas || collectionPersonas.length === 0) {
      return [];
    }
    
    // Extract the persona_ids
    const personaIds = collectionPersonas.map(cp => cp.persona_id);
    
    // Then fetch the actual personas (lightweight)
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('id, persona_id, name, description, user_id, is_public, created_at')
      .in('persona_id', personaIds)
      .order('created_at', { ascending: false });
    
    if (personasError) throw personasError;
    
    return personas ? personas.map(item => ({
      id: item.id,
      persona_id: item.persona_id,
      name: item.name,
      description: item.description || `Created on ${new Date(item.created_at).toLocaleDateString()}`,
      user_id: item.user_id,
      is_public: item.is_public,
      created_at: item.created_at,
      updated_at: item.created_at,
      // Placeholder values for required fields
      metadata: {},
      trait_profile: {},
      behavioral_modulation: {},
      linguistic_profile: {},
      emotional_triggers: null,
      preinterview_tags: [],
      simulation_directives: {},
      interview_sections: [],
      prompt: null
    } as Persona)) : [];
  } catch (error) {
    console.error("Error getting personas by collection for listing:", error);
    return [];
  }
}

export async function getPersonasByCollection(collectionId: string): Promise<Persona[]> {
  try {
    // First get the persona_ids from the collection_personas table
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (collectionError) throw collectionError;
    
    if (!collectionPersonas || collectionPersonas.length === 0) {
      return [];
    }
    
    // Extract the persona_ids
    const personaIds = collectionPersonas.map(cp => cp.persona_id);
    
    // Then fetch the actual personas
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .in('persona_id', personaIds)
      .order('created_at', { ascending: false });
    
    if (personasError) throw personasError;
    
    return personas ? personas.map(dbPersonaToPersona) : [];
  } catch (error) {
    console.error("Error getting personas by collection:", error);
    return [];
  }
}
