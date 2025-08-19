import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";
import { logTraitValidation } from "./traitValidation";
import { validatePersonaCompleteness, logPersonaValidation } from "./validation/personaValidation";

// Now generates PersonaV2 format and saves to personas_v2 table
export const generatePersona = async (prompt: string): Promise<boolean> => {
  try {
    toast.info("Generating persona...", {
      id: "persona-generation",
      duration: 10000,
    });
    
    console.log("=== STARTING PersonaV2 GENERATION ===");
    console.log("Starting PersonaV2 generation for prompt:", prompt);

    // Get the current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("❌ Error getting user:", userError);
      toast.error("Authentication error - please try logging in again", { id: "persona-generation" });
      return false;
    }
    
    const userId = user?.id;
    console.log("Current user ID:", userId);

    if (!userId) {
      console.error("❌ No authenticated user found");
      toast.error("You must be logged in to create personas", { id: "persona-generation" });
      return false;
    }

    console.log("Calling generate-persona edge function (PersonaV2)...");
    const { data, error } = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    if (error) {
      console.error("❌ Error calling generate-persona function:", error);
      toast.error(`Failed to generate persona: ${error.message}`, { id: "persona-generation" });
      return false;
    }

    console.log("Edge function response received:", data);

    if (!data.success || !data.persona) {
      console.error("❌ PersonaV2 generation failed:", data.error || "Unknown error");
      toast.error(`Failed to generate persona: ${data.error || "Unknown error"}`, { id: "persona-generation" });
      return false;
    }

    const personaV2 = data.persona;
    console.log("✅ Successfully generated PersonaV2:", personaV2.identity.name);
    
    console.log("=== SAVING PersonaV2 TO DATABASE ===");
    try {
      // Create the personas_v2 record
      const v2Record = {
        persona_id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        name: personaV2.identity.name,
        description: personaV2.identity.core_identity_narrative,
        persona_data: personaV2,
        persona_type: 'humanoid',
        is_public: false
      };
      
      console.log("Saving PersonaV2 to personas_v2 table...");
      const { data: savedV2, error: saveV2Error } = await supabase
        .from('personas_v2')
        .insert(v2Record)
        .select()
        .single();
      
      if (saveV2Error) {
        console.error("❌ Failed to save PersonaV2:", saveV2Error);
        toast.error(`Failed to save persona: ${saveV2Error.message}`, { id: "persona-generation" });
        return false;
      }
      
      console.log("✅ PersonaV2 saved successfully with ID:", savedV2.persona_id);
      
      toast.success(`"${personaV2.identity.name}" created successfully!`, { id: "persona-generation" });
      console.log("=== PersonaV2 GENERATION COMPLETED ===");
      return true;
      
    } catch (saveError: any) {
      console.error("❌ Error saving PersonaV2 to database:", saveError);
      toast.error(`Error saving persona: ${saveError.message || "Unknown database error"}`, { id: "persona-generation" });
      return false;
    }
  } catch (error: any) {
    console.error("❌ Unexpected error in generatePersona:", error);
    toast.error(`An unexpected error occurred: ${error.message || "Unknown error"}`, { id: "persona-generation" });
    return false;
  }
};

