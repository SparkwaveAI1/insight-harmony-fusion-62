
import { supabase } from "@/integrations/supabase/client";

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

    return response.data.persona;
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
    
    const { data, error } = await supabase
      .from('personas')
      .insert(persona)
      .select()
      .single();

    if (error) {
      console.error("Error saving persona to Supabase:", error);
      throw error;
    }
    
    return data;
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
    return data;
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
    return data;
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
    return data || [];
  } catch (error) {
    console.error("Error getting all personas:", error);
    return [];
  }
}
