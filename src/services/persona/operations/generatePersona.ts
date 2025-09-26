import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";

export async function generatePersona(prompt: string): Promise<Persona | null> {
  try {
    // Call the V4 unified persona generation function
    const { data, error } = await supabase.functions.invoke('v4-persona-unified', {
      body: { 
        prompt,
        stage: 'full_generation'
      }
    });

    if (error) {
      console.error('Error generating persona:', error);
      return null;
    }

    return data?.persona || null;
  } catch (error) {
    console.error('Error in generatePersona:', error);
    return null;
  }
}