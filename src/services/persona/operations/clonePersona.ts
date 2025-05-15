
import { Persona } from "../types";
import { personaToDbPersona, dbPersonaToPersona } from "../mappers";
import { supabase } from "@/integrations/supabase/client";

export async function clonePersona(personaData: Persona): Promise<Persona | null> {
  try {
    console.log("Cloning persona with customizations");
    
    // Generate a new persona_id
    personaData.persona_id = crypto.randomUUID().substring(0, 8);
    // Update creation date
    personaData.creation_date = new Date().toISOString().split('T')[0];
    
    // Extract customization notes if present in the prompt
    let customizationNotes = "";
    const customizationMatch = personaData.prompt?.match(/Customization Notes: (.*?)(?=\n|$)/);
    if (customizationMatch && customizationMatch[1]) {
      customizationNotes = customizationMatch[1].trim();
      
      // Remove the customization notes from the prompt to avoid duplication
      personaData.prompt = personaData.prompt.replace(/\s*Customization Notes:.*?(?=\n|$)/, "").trim();
      
      console.log("Extracted customization notes:", customizationNotes);
      console.log("Cleaned prompt:", personaData.prompt);
    }
    
    // Create a sanitized version of the persona data with all required fields
    const sanitizedPersona = {
      persona_id: personaData.persona_id,
      name: personaData.name,
      creation_date: personaData.creation_date,
      // If customization notes exist, append them to the prompt in a way that makes them part of the persona's design
      prompt: customizationNotes ? 
        `${personaData.prompt}\n\nCustomization: ${customizationNotes}` : 
        personaData.prompt,
      metadata: personaData.metadata || {},
      interview_sections: personaData.interview_sections || {},
      trait_profile: personaData.trait_profile || {},
      linguistic_profile: personaData.linguistic_profile || {},
      // Make sure the behavioral_modulation is never null
      behavioral_modulation: personaData.behavioral_modulation || {},
      // Make sure preinterview_tags is never null
      preinterview_tags: personaData.preinterview_tags || [],
      // Make sure simulation_directives is never null
      simulation_directives: personaData.simulation_directives || {},
      is_public: false,
    };
    
    // If there are customization notes, make specific modifications to the persona
    if (customizationNotes) {
      console.log("Applying customizations to persona");
      
      // Update the persona's metadata to indicate it's customized
      if (sanitizedPersona.metadata) {
        sanitizedPersona.metadata = {
          ...sanitizedPersona.metadata,
          customized: true,
          customization_notes: customizationNotes
        };
      }
    }
    
    // Convert to the format expected by the database
    const dbPersona = personaToDbPersona(sanitizedPersona as Persona);
    
    const { data, error } = await supabase
      .from('personas')
      .insert(dbPersona)
      .select()
      .single();

    if (error) {
      console.error("Error cloning persona:", error);
      throw error;
    }
    
    console.log("Persona successfully cloned:", data);
    return dbPersonaToPersona(data);
  } catch (error) {
    console.error("Error in clonePersona:", error);
    return null;
  }
}
