
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface PersonaMetadata {
  age: string | null;
  gender: string | null;
  race_ethnicity: string | null;
  region: string | null;
  location_history: {
    grew_up_in: string | null;
    current_residence: string | null;
  };
  income_level: string | null;
  education_level: string | null;
  occupation: string | null;
  relationship_status: string | null;
  children_or_caregiver: string | null;
  cultural_background: string | null;
  disabilities_or_conditions: string | null;
  family_medical_history: string | null;
}

// Database Persona type that matches the Supabase table structure
export interface DbPersona {
  id?: string;
  persona_id: string;
  name: string;
  creation_date: string;
  prompt?: string | null;
  metadata: Json;
  trait_profile: Json;
  behavioral_modulation: Json;
  linguistic_profile: Json;
  preinterview_tags: Json;
  simulation_directives: Json;
  interview_sections: Json;
  created_at?: string | null;
}

// Application Persona type with strongly typed properties
export interface Persona {
  id?: string;
  persona_id: string;
  name: string;
  creation_date: string;
  prompt?: string;
  metadata: PersonaMetadata;
  trait_profile: Record<string, any>;
  behavioral_modulation: Record<string, any>;
  linguistic_profile: Record<string, any>;
  preinterview_tags: string[];
  simulation_directives: Record<string, any>;
  interview_sections: Array<{
    section: string;
    notes: string;
    questions: string[];
    responses?: string[];
  }>;
  created_at?: string;
}

/**
 * Convert a Persona to a DbPersona for database storage
 */
function personaToDbPersona(persona: Persona): DbPersona {
  return {
    ...persona,
    metadata: persona.metadata as unknown as Json,
    trait_profile: persona.trait_profile as unknown as Json,
    behavioral_modulation: persona.behavioral_modulation as unknown as Json,
    linguistic_profile: persona.linguistic_profile as unknown as Json,
    preinterview_tags: persona.preinterview_tags as unknown as Json,
    simulation_directives: persona.simulation_directives as unknown as Json,
    interview_sections: persona.interview_sections as unknown as Json,
  };
}

/**
 * Convert a DbPersona to a Persona for application use
 */
function dbPersonaToPersona(dbPersona: DbPersona): Persona {
  return {
    ...dbPersona,
    metadata: dbPersona.metadata as unknown as PersonaMetadata,
    trait_profile: dbPersona.trait_profile as unknown as Record<string, any>,
    behavioral_modulation: dbPersona.behavioral_modulation as unknown as Record<string, any>,
    linguistic_profile: dbPersona.linguistic_profile as unknown as Record<string, any>,
    preinterview_tags: dbPersona.preinterview_tags as unknown as string[],
    simulation_directives: dbPersona.simulation_directives as unknown as Record<string, any>,
    interview_sections: dbPersona.interview_sections as unknown as Array<{
      section: string;
      notes: string;
      questions: string[];
      responses?: string[];
    }>,
  };
}

/**
 * Generate a persona from a user prompt
 */
export async function generatePersona(prompt: string): Promise<Persona | null> {
  try {
    console.log("Generating persona with prompt:", prompt);
    
    const response = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    if (!response.data || !response.data.success) {
      console.error("Error generating persona:", response.error || (response.data && response.data.error));
      throw new Error(response.error?.message || (response.data && response.data.error) || "Failed to generate persona");
    }

    // Add the prompt to the persona
    const persona = response.data.persona;
    persona.prompt = prompt;
    
    return persona;
  } catch (error) {
    console.error("Error in generatePersona:", error);
    throw error;
  }
}

/**
 * Save a persona to Supabase
 */
export async function savePersona(persona: Persona): Promise<Persona | null> {
  try {
    console.log("Saving persona to Supabase:", persona.persona_id);
    
    // Convert Persona to DbPersona for saving to the database
    const dbPersona = personaToDbPersona(persona);
    
    const { data, error } = await supabase
      .from('personas')
      .insert(dbPersona)
      .select()
      .single();

    if (error) {
      console.error("Error saving persona to Supabase:", error);
      throw error;
    }
    
    // Convert DbPersona back to Persona for application use
    return dbPersonaToPersona(data);
  } catch (error) {
    console.error("Error in savePersona:", error);
    throw error;
  }
}

/**
 * Get a persona by ID
 */
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

/**
 * Get a persona by persona_id
 */
export async function getPersonaByPersonaId(personaId: string): Promise<Persona | null> {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error) throw error;
    return data ? dbPersonaToPersona(data) : null;
  } catch (error) {
    console.error("Error getting persona by persona_id:", error);
    return null;
  }
}

/**
 * Get all personas
 */
export async function getAllPersonas(): Promise<Persona[]> {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(dbPersonaToPersona) : [];
  } catch (error) {
    console.error("Error getting all personas:", error);
    return [];
  }
}
