import { supabase } from "@/integrations/supabase/client";
import { PersonaV2 } from "../../../types/persona-v2";
import { getPersonaV2ById, getAllPersonasV2, getPublicPersonasV2 } from "./personaV2Operations";
import { dbPersonaToPersona } from "../mappers";
import { Persona } from "../types";

/**
 * Unified Persona Operations - V2 Priority System
 * 
 * This service prioritizes V2 personas over V1 personas:
 * 1. First checks for V2 version of the persona
 * 2. If V2 exists, returns that (converted to app format)
 * 3. If no V2 exists, falls back to V1 version
 * 4. Ensures backward compatibility while transitioning to V2
 */

export interface UnifiedPersona {
  id: string;
  persona_id: string;
  name: string;
  description: string | null;
  version: 'v1' | 'v2';
  data: Persona | PersonaV2;
  profile_image_url?: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Get a persona by persona_id, prioritizing V2 over V1
 */
export async function getUnifiedPersonaById(personaId: string): Promise<UnifiedPersona | null> {
  try {
    console.log(`🔍 Fetching unified persona: ${personaId}`);
    
    // Step 1: Check for V2 version first
    const v2Persona = await getPersonaV2ById(personaId);
    if (v2Persona) {
      console.log(`✅ Found V2 persona: ${personaId}`);
      return {
        id: v2Persona.id,
        persona_id: v2Persona.persona_id,
        name: v2Persona.name,
        description: v2Persona.description,
        version: 'v2',
        data: v2Persona.persona_data,
        profile_image_url: v2Persona.profile_image_url,
        is_public: v2Persona.is_public,
        user_id: v2Persona.user_id,
        created_at: v2Persona.created_at,
        updated_at: v2Persona.updated_at,
      };
    }

    // Step 2: Fall back to V1 if no V2 exists
    console.log(`🔄 No V2 found, checking V1 for: ${personaId}`);
    const { data: v1Data, error: v1Error } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .maybeSingle();

    if (v1Error) {
      console.error(`❌ Error fetching V1 persona ${personaId}:`, v1Error);
      return null;
    }

    if (!v1Data) {
      console.log(`❌ No persona found (V1 or V2): ${personaId}`);
      return null;
    }

    console.log(`✅ Found V1 persona: ${personaId}`);
    const convertedV1 = dbPersonaToPersona(v1Data);
    
    return {
      id: v1Data.id,
      persona_id: v1Data.persona_id,
      name: v1Data.name,
      description: v1Data.description,
      version: 'v1',
      data: convertedV1,
      profile_image_url: v1Data.profile_image_url,
      is_public: v1Data.is_public || false,
      user_id: v1Data.user_id,
      created_at: v1Data.created_at,
    };

  } catch (error) {
    console.error(`❌ Error in getUnifiedPersonaById for ${personaId}:`, error);
    return null;
  }
}

/**
 * Get all personas for a user, prioritizing V2 over V1
 */
export async function getAllUnifiedPersonas(userId?: string): Promise<UnifiedPersona[]> {
  try {
    console.log('🔍 Fetching all unified personas');
    
    const personas: UnifiedPersona[] = [];

    // Step 1: Get all V2 personas
    const v2Personas = await getAllPersonasV2(userId);
    const v2PersonaIds = new Set<string>();

    for (const v2Persona of v2Personas) {
      v2PersonaIds.add(v2Persona.persona_id);
      personas.push({
        id: v2Persona.id,
        persona_id: v2Persona.persona_id,
        name: v2Persona.name,
        description: v2Persona.description,
        version: 'v2',
        data: v2Persona.persona_data,
        profile_image_url: v2Persona.profile_image_url,
        is_public: v2Persona.is_public,
        user_id: v2Persona.user_id,
        created_at: v2Persona.created_at,
        updated_at: v2Persona.updated_at,
      });
    }

    // Step 2: Get V1 personas that don't have V2 versions
    let v1Query = supabase
      .from('personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      v1Query = v1Query.eq('user_id', userId);
    } else {
      v1Query = v1Query.eq('is_public', true);
    }

    const { data: v1Data, error: v1Error } = await v1Query;

    if (v1Error) {
      console.error('❌ Error fetching V1 personas:', v1Error);
    } else if (v1Data) {
      // Only include V1 personas that don't have V2 versions
      for (const v1Persona of v1Data) {
        if (!v2PersonaIds.has(v1Persona.persona_id)) {
          const convertedV1 = dbPersonaToPersona(v1Persona);
          personas.push({
            id: v1Persona.id,
            persona_id: v1Persona.persona_id,
            name: v1Persona.name,
            description: v1Persona.description,
            version: 'v1',
            data: convertedV1,
            profile_image_url: v1Persona.profile_image_url,
            is_public: v1Persona.is_public || false,
            user_id: v1Persona.user_id,
            created_at: v1Persona.created_at,
          });
        }
      }
    }

    console.log(`✅ Retrieved ${personas.length} unified personas (${v2Personas.length} V2, ${personas.length - v2Personas.length} V1)`);
    
    // Sort by created_at descending
    personas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return personas;

  } catch (error) {
    console.error('❌ Error in getAllUnifiedPersonas:', error);
    return [];
  }
}

/**
 * Get public personas, prioritizing V2 over V1
 */
export async function getPublicUnifiedPersonas(): Promise<UnifiedPersona[]> {
  return getAllUnifiedPersonas(); // This already handles public filtering
}

/**
 * Get personas for listing (lightweight), prioritizing V2 over V1
 */
export async function getUnifiedPersonasForListing(): Promise<UnifiedPersona[]> {
  try {
    console.log('🔍 Fetching unified personas for listing');
    
    const personas: UnifiedPersona[] = [];

    // Step 1: Get V2 personas (lightweight)
    const { data: v2Data, error: v2Error } = await supabase
      .from('personas_v2')
      .select('id, persona_id, name, description, profile_image_url, is_public, user_id, created_at, updated_at')
      .order('created_at', { ascending: false });

    const v2PersonaIds = new Set<string>();

    if (v2Error) {
      console.error('❌ Error fetching V2 personas for listing:', v2Error);
    } else if (v2Data) {
      for (const v2Persona of v2Data) {
        v2PersonaIds.add(v2Persona.persona_id);
        personas.push({
          id: v2Persona.id,
          persona_id: v2Persona.persona_id,
          name: v2Persona.name,
          description: v2Persona.description,
          version: 'v2',
          data: {} as PersonaV2, // Lightweight - no full data
          profile_image_url: v2Persona.profile_image_url,
          is_public: v2Persona.is_public,
          user_id: v2Persona.user_id,
          created_at: v2Persona.created_at,
          updated_at: v2Persona.updated_at,
        });
      }
    }

    // Step 2: Get V1 personas that don't have V2 versions (lightweight)
    const { data: v1Data, error: v1Error } = await supabase
      .from('personas')
      .select('id, persona_id, name, description, creation_date, user_id, is_public, created_at, profile_image_url')
      .order('created_at', { ascending: false });

    if (v1Error) {
      console.error('❌ Error fetching V1 personas for listing:', v1Error);
    } else if (v1Data) {
      for (const v1Persona of v1Data) {
        if (!v2PersonaIds.has(v1Persona.persona_id)) {
          personas.push({
            id: v1Persona.id,
            persona_id: v1Persona.persona_id,
            name: v1Persona.name,
            description: v1Persona.description || `Created on ${v1Persona.creation_date}`,
            version: 'v1',
            data: {} as Persona, // Lightweight - no full data
            profile_image_url: v1Persona.profile_image_url,
            is_public: v1Persona.is_public || false,
            user_id: v1Persona.user_id,
            created_at: v1Persona.created_at,
          });
        }
      }
    }

    console.log(`✅ Retrieved ${personas.length} unified personas for listing`);
    return personas;

  } catch (error) {
    console.error('❌ Error in getUnifiedPersonasForListing:', error);
    return [];
  }
}

/**
 * Check if a persona exists and in which version
 */
export async function checkPersonaVersion(personaId: string): Promise<'v1' | 'v2' | 'not_found'> {
  try {
    // Check V2 first
    const v2Persona = await getPersonaV2ById(personaId);
    if (v2Persona) return 'v2';

    // Check V1
    const { data: v1Data } = await supabase
      .from('personas')
      .select('persona_id')
      .eq('persona_id', personaId)
      .maybeSingle();

    if (v1Data) return 'v1';

    return 'not_found';
  } catch (error) {
    console.error(`❌ Error checking persona version for ${personaId}:`, error);
    return 'not_found';
  }
}