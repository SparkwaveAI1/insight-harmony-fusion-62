
import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";
import { generatePersonaImage } from "./operations/generatePersonaImage";

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
      console.log("Persona saved to database, now generating image...");
      toast.info("Generating profile image...", { 
        id: "image-generation", 
        duration: 20000 
      });
      
      // Generate image for the persona
      const imageUrl = await generatePersonaImage(savedPersona);
      
      if (imageUrl) {
        console.log("Profile image generated:", imageUrl);
        toast.success("Profile image generated!", { id: "image-generation" });
        
        // Update the persona with the image URL
        const updatedPersona = {
          ...savedPersona,
          profile_image_url: imageUrl
        };
        
        // Save the updated persona with image URL
        const finalPersona = await savePersona(updatedPersona);
        return finalPersona;
      } else {
        console.warn("Failed to generate profile image, returning persona without image");
        toast.error("Failed to generate profile image", { id: "image-generation" });
        return savedPersona;
      }
    }
    
    return savedPersona;
  } catch (error) {
    console.error("Error in generatePersona:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};
