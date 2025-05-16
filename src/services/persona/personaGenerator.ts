
import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const generatePersona = async (prompt: string): Promise<Persona | null> => {
  try {
    toast.info("Generating persona...", {
      id: "persona-generation",
      duration: 10000,
    });
    
    console.log("Starting persona generation for prompt:", prompt);

    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    console.log("Current user ID:", userId);

    const { data, error } = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    if (error) {
      console.error("Error generating persona:", error);
      toast.error("Failed to generate persona", { id: "persona-generation" });
      return null;
    }

    if (!data.success || !data.persona) {
      console.error("Persona generation failed:", data.error || "Unknown error");
      toast.error(`Failed to generate persona: ${data.error || "Unknown error"}`, { id: "persona-generation" });
      return null;
    }

    console.log("Successfully generated persona:", data.persona.name);
    console.log("Generated persona ID:", data.persona.persona_id);
    
    // Add the user_id to the persona before saving
    if (userId) {
      data.persona.user_id = userId;
      console.log("Assigning user ID to persona:", userId);
    } else {
      console.warn("No user ID available, persona will be created without a user association");
    }
    
    // Save the persona to the database
    try {
      const savedPersona = await savePersona(data.persona);
      
      if (savedPersona) {
        console.log("Persona saved to database successfully with ID:", savedPersona.persona_id);
        console.log("Saved persona user_id:", savedPersona.user_id);
        toast.success("Persona generated successfully!", { id: "persona-generation" });
        return savedPersona;
      } else {
        console.error("Failed to save persona to database - savePersona returned null");
        toast.error("Failed to save persona to database", { id: "persona-generation" });
        return null;
      }
    } catch (saveError) {
      console.error("Error saving persona to database:", saveError);
      toast.error(`Error saving persona: ${saveError.message || "Unknown error"}`, { id: "persona-generation" });
      return null;
    }
  } catch (error) {
    console.error("Error in generatePersona:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};
