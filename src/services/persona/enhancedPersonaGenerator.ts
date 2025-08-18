
import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";
import { logTraitValidation } from "./traitValidation";
import { validatePersonaCompleteness, logPersonaValidation } from "./validation/personaValidation";
import { ProgressCallback, CREATION_STEPS, createProgressUpdate } from "./progressService";
import { getOrCompileVoicepack } from "../voicepack";

export const generatePersonaWithProgress = async (
  prompt: string, 
  onProgress: ProgressCallback
): Promise<Persona | null> => {
  try {
    // Step 1: Validation
    onProgress(createProgressUpdate(CREATION_STEPS.VALIDATION));
    
    console.log("=== STARTING ENHANCED PERSONA GENERATION WITH PROGRESS ===");
    console.log("Starting persona generation for prompt:", prompt);

    // Get the current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("❌ Error getting user:", userError);
      onProgress(createProgressUpdate(
        CREATION_STEPS.VALIDATION, 
        true, 
        "Authentication error - please try logging in again"
      ));
      return null;
    }
    
    const userId = user?.id;
    console.log("Current user ID:", userId);

    if (!userId) {
      console.error("❌ No authenticated user found");
      onProgress(createProgressUpdate(
        CREATION_STEPS.VALIDATION, 
        true, 
        "You must be logged in to create personas"
      ));
      return null;
    }

    // Step 2: Generate persona via edge function
    onProgress(createProgressUpdate(CREATION_STEPS.DEMOGRAPHICS));
    
    console.log("Calling generate-persona edge function...");
    const { data, error } = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    if (error) {
      console.error("❌ Error calling generate-persona function:", error);
      onProgress(createProgressUpdate(
        CREATION_STEPS.DEMOGRAPHICS, 
        true, 
        `Failed to generate persona: ${error.message}`
      ));
      return null;
    }

    console.log("Edge function response received:", data);

    if (!data.success || !data.persona) {
      console.error("❌ Persona generation failed:", data.error || "Unknown error");
      onProgress(createProgressUpdate(
        CREATION_STEPS.TRAITS, 
        true, 
        `Failed to generate persona: ${data.error || "Unknown error"}`
      ));
      return null;
    }

    // Step 3: Validation of generated persona
    onProgress(createProgressUpdate(CREATION_STEPS.INTERVIEW));
    
    console.log("✅ Successfully generated persona:", data.persona.name);
    console.log("Generated persona ID:", data.persona.persona_id);
    
    // CRITICAL: Validate persona completeness
    console.log("=== VALIDATING PERSONA COMPLETENESS ===");
    const validationResult = validatePersonaCompleteness(data.persona);
    logPersonaValidation(data.persona, validationResult);
    
    if (!validationResult.isValid) {
      console.error("❌ PERSONA FAILED VALIDATION");
      const errorMsg = `Persona generation incomplete: ${validationResult.errors.join(', ')}`;
      onProgress(createProgressUpdate(
        CREATION_STEPS.INTERVIEW, 
        true, 
        errorMsg
      ));
      // Continue saving but with warning
      toast.warning("Persona created with some missing data - check details page", { 
        duration: 5000 
      });
    }
    
    // Validate the enhanced traits
    console.log("=== VALIDATING ENHANCED TRAITS ===");
    logTraitValidation(data.persona);
    
    // Add the user_id to the persona before saving
    data.persona.user_id = userId;
    console.log("✅ Assigned user ID to persona:", userId);
    
    // Step 4: Save to database
    onProgress(createProgressUpdate(CREATION_STEPS.SAVING));
    
    console.log("=== SAVING PERSONA TO DATABASE ===");
    try {
      const savedPersona = await savePersona(data.persona);
      
      if (savedPersona) {
        console.log("✅ Persona saved to database successfully with ID:", savedPersona.persona_id);
        
        // Step 4.5: Compile voicepack (PersonaV2 uses persona_id from savedPersona)
        console.log("=== COMPILING VOICEPACK ===");
        try {
          const voicepack = await getOrCompileVoicepack(savedPersona.persona_id);
          console.log("✅ Voicepack compiled successfully");
        } catch (voicepackError) {
          console.warn("⚠️ Voicepack compilation failed (continuing anyway):", voicepackError);
        }
        
        // Step 5: Complete
        onProgress(createProgressUpdate(CREATION_STEPS.COMPLETE));
        
        // Final validation of saved persona
        const finalValidation = validatePersonaCompleteness(savedPersona);
        if (finalValidation.isValid) {
          toast.success(`"${savedPersona.name}" created successfully!`);
        } else {
          toast.warning(`"${savedPersona.name}" created but may be incomplete. Check details page.`, { 
            duration: 6000
          });
        }
        
        console.log("=== PERSONA GENERATION COMPLETED ===");
        return savedPersona;
      } else {
        console.error("❌ Failed to save persona to database - savePersona returned null");
        onProgress(createProgressUpdate(
          CREATION_STEPS.SAVING, 
          true, 
          "Failed to save persona to database"
        ));
        return null;
      }
    } catch (saveError: any) {
      console.error("❌ Error saving persona to database:", saveError);
      onProgress(createProgressUpdate(
        CREATION_STEPS.SAVING, 
        true, 
        `Error saving persona: ${saveError.message || "Unknown database error"}`
      ));
      return null;
    }
  } catch (error: any) {
    console.error("❌ Unexpected error in generatePersonaWithProgress:", error);
    onProgress(createProgressUpdate(
      CREATION_STEPS.VALIDATION, 
      true, 
      `An unexpected error occurred: ${error.message || "Unknown error"}`
    ));
    return null;
  }
};
