
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "./types";

export async function generatePersona(prompt: string): Promise<Persona | null> {
  try {
    console.log("Generating persona with prompt:", prompt);
    
    const response = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    console.log("Response from generate-persona function:", response);

    if (!response.data || !response.data.success) {
      console.error("Error generating persona:", response.error || (response.data && response.data.error));
      throw new Error(response.error?.message || (response.data && response.data.error) || "Failed to generate persona");
    }

    // Add the prompt to the persona
    const persona = response.data.persona;
    persona.prompt = prompt;
    
    console.log("Generated persona:", persona);
    console.log("Interview sections generated:", JSON.stringify(persona.interview_sections, null, 2));
    console.log("Persona ID:", persona.persona_id);
    return persona;
  } catch (error) {
    console.error("Error in generatePersona:", error);
    throw error;
  }
}
