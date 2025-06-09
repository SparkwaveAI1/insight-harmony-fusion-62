
import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";
import { logTraitValidation } from "./traitValidation";

export const generatePersona = async (prompt: string): Promise<Persona | null> => {
  try {
    toast.info("Generating persona...", {
      id: "persona-generation",
      duration: 10000,
    });
    
    console.log("=== STARTING PERSONA GENERATION ===");
    console.log("Starting persona generation for prompt:", prompt);

    // Get the current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user:", userError);
      toast.error("Authentication error - please try logging in again", { id: "persona-generation" });
      return null;
    }
    
    const userId = user?.id;
    console.log("Current user ID:", userId);

    if (!userId) {
      console.error("No authenticated user found");
      toast.error("You must be logged in to create personas", { id: "persona-generation" });
      return null;
    }

    console.log("Calling generate-persona edge function...");
    const { data, error } = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    if (error) {
      console.error("❌ Error calling generate-persona function:", error);
      toast.error(`Failed to generate persona: ${error.message}`, { id: "persona-generation" });
      return null;
    }

    console.log("Edge function response received:", data);

    if (!data.success || !data.persona) {
      console.error("❌ Persona generation failed:", data.error || "Unknown error");
      toast.error(`Failed to generate persona: ${data.error || "Unknown error"}`, { id: "persona-generation" });
      return null;
    }

    console.log("✅ Successfully generated persona:", data.persona.name);
    console.log("Generated persona ID:", data.persona.persona_id);
    
    // Validate the enhanced traits
    console.log("=== VALIDATING ENHANCED TRAITS ===");
    logTraitValidation(data.persona);
    
    // Log specific enhanced trait values for verification
    console.log("=== ENHANCED TRAIT VALUES ===");
    const traitProfile = data.persona.trait_profile;
    
    if (traitProfile?.world_values) {
      console.log("World Values:", {
        traditional_vs_secular: traitProfile.world_values.traditional_vs_secular,
        survival_vs_self_expression: traitProfile.world_values.survival_vs_self_expression,
        materialist_vs_postmaterialist: traitProfile.world_values.materialist_vs_postmaterialist
      });
    }
    
    if (traitProfile?.political_compass) {
      console.log("Enhanced Political Compass:", {
        political_salience: traitProfile.political_compass.political_salience,
        group_fusion_level: traitProfile.political_compass.group_fusion_level,
        outgroup_threat_sensitivity: traitProfile.political_compass.outgroup_threat_sensitivity,
        commons_orientation: traitProfile.political_compass.commons_orientation,
        cultural_conservative_progressive: traitProfile.political_compass.cultural_conservative_progressive,
        political_motivations: traitProfile.political_compass.political_motivations
      });
    }
    
    // Add the user_id to the persona before saving
    data.persona.user_id = userId;
    console.log("✅ Assigned user ID to persona:", userId);
    
    // Save the persona to the database
    console.log("=== SAVING PERSONA TO DATABASE ===");
    try {
      const savedPersona = await savePersona(data.persona);
      
      if (savedPersona) {
        console.log("✅ Persona saved to database successfully with ID:", savedPersona.persona_id);
        console.log("✅ Saved persona user_id:", savedPersona.user_id);
        console.log("✅ Saved persona name:", savedPersona.name);
        toast.success(`"${savedPersona.name}" created successfully!`, { id: "persona-generation" });
        console.log("=== PERSONA GENERATION COMPLETED SUCCESSFULLY ===");
        return savedPersona;
      } else {
        console.error("❌ Failed to save persona to database - savePersona returned null");
        toast.error("Failed to save persona to database", { id: "persona-generation" });
        return null;
      }
    } catch (saveError: any) {
      console.error("❌ Error saving persona to database:", saveError);
      console.error("Save error details:", {
        message: saveError.message,
        stack: saveError.stack,
        cause: saveError.cause
      });
      toast.error(`Error saving persona: ${saveError.message || "Unknown database error"}`, { id: "persona-generation" });
      return null;
    }
  } catch (error: any) {
    console.error("❌ Unexpected error in generatePersona:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    toast.error(`An unexpected error occurred: ${error.message || "Unknown error"}`);
    return null;
  }
};
