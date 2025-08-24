import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { V4Persona } from "@/types/persona-v4";

export async function getPersonaById(id: string): Promise<Persona | null> {
  try {
    // Legacy personas table no longer exists - return null
    console.warn('getPersonaById is deprecated - use V4 personas instead');
    return null;
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
        
        const convertedPersona: Persona = {
          id: v4Data.id,
          persona_id: v4Data.persona_id,
          name: v4Data.name,
          description: backgroundDescription || `${v4Data.name} - V4 Enhanced Persona`,
          user_id: v4Data.user_id,
          is_public: v4Data.is_public || false,
          created_at: v4Data.created_at || '',
          updated_at: v4Data.updated_at || '',
          metadata: {},
          trait_profile: {},
          behavioral_modulation: {},
          linguistic_profile: {},
          emotional_triggers: null,
          preinterview_tags: [],
          simulation_directives: {},
          interview_sections: [],
          prompt: null,
          profile_image_url: v4Data.profile_image_url,
          // Preserve V4 fields for correct detection
          schema_version: v4Data.schema_version,
          full_profile: v4Data.full_profile,
          conversation_summary: (conversationSummary || {}) as any
        };
        
        return convertedPersona;
      }
      
      console.log(`No V4 persona found with ID ${personaId}`);
      return null;
    }
    
    // For non-V4 personas, legacy personas table no longer exists
    console.log(`Non-V4 persona ID provided but legacy personas no longer exist: ${personaId}`);
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
    // Legacy personas table no longer exists - return empty array
    console.warn('getPersonasForListing is deprecated - use V4 personas instead');
    return [];
  } catch (error) {
    console.error("Error getting personas for listing:", error);
    return [];
  }
}

export async function getAllPersonas(): Promise<V4Persona[]> {
  try {
    const timestamp = new Date().toISOString();
    console.log(`🚀 [${timestamp}] getAllPersonas: PRODUCTION CODE RUNNING - Build: ${Date.now()}`);
    console.log(`🔍 [${timestamp}] getAllPersonas: Using V4_PERSONAS table (NOT legacy personas)`);
    console.log(`🔍 Supabase URL: https://wgerdrdsuusnrdnwwelt.supabase.co`);
    console.log(`🔍 Environment: ${process.env.NODE_ENV}`);
    
    // Fetch only V4 personas with enhanced logging
    const { data: v4Personas, error: v4Error } = await supabase
      .from('v4_personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (v4Error) {
      console.error(`🔍 [${timestamp}] Supabase query error:`, {
        message: v4Error.message,
        details: v4Error.details,
        hint: v4Error.hint,
        code: v4Error.code
      });
      throw v4Error;
    }

    console.log(`🔍 [${timestamp}] Supabase query successful`);
    console.log(`🔍 Retrieved ${v4Personas?.length || 0} V4 personas`);
    
    if (v4Personas && v4Personas.length > 0) {
      console.log(`🔍 First persona sample:`, {
        id: v4Personas[0].persona_id,
        name: v4Personas[0].name,
        isPublic: v4Personas[0].is_public,
        userId: v4Personas[0].user_id
      });
      
      const publicCount = v4Personas.filter(p => p.is_public).length;
      console.log(`🔍 Public personas in result: ${publicCount}`);
    }
    
    return (v4Personas || []) as unknown as V4Persona[];
  } catch (error: any) {
    const errorTimestamp = new Date().toISOString();
    console.error(`🔍 [${errorTimestamp}] getAllPersonas error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return [];
  }
}

// Lightweight version for collection personas
export async function getPersonasByCollectionForListing(collectionId: string): Promise<Persona[]> {
  try {
    // Legacy personas table no longer exists - return empty array for now
    // Collections should use V4 personas instead
    console.warn('getPersonasByCollectionForListing is deprecated - use V4 personas instead');
    return [];
  } catch (error) {
    console.error("Error getting personas by collection for listing:", error);
    return [];
  }
}

export async function getPersonasByCollection(collectionId: string): Promise<Persona[]> {
  try {
    // Legacy personas table no longer exists - return empty array for now
    // Collections should use V4 personas instead
    console.warn('getPersonasByCollection is deprecated - use V4 personas instead');
    return [];
  } catch (error) {
    console.error("Error getting personas by collection:", error);
    return [];
  }
}