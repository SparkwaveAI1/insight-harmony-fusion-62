
import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";

export const generatePersona = async (prompt: string): Promise<Persona | null> => {
  try {
    toast.info("Generating persona...", {
      id: "persona-generation",
      duration: 10000,
    });
    
    console.log("Starting persona generation for prompt:", prompt);

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
    toast.success("Persona generated successfully!", { id: "persona-generation" });
    
    // Save the persona to the database
    const savedPersona = await savePersona(data.persona);
    
    if (savedPersona) {
      console.log("Persona saved to database successfully");
      return savedPersona;
    }
    
    return null;
  } catch (error) {
    console.error("Error in generatePersona:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};
