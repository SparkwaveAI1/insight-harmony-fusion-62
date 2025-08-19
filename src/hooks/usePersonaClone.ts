
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Persona } from "@/services/persona/types";
import { generatePersona } from "@/services/persona";
import { cloneFormSchema, CloneFormValues } from "../components/persona-details/clone/cloneFormSchema";

export function usePersonaClone(persona: Persona) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize form with current persona data
  const form = useForm<CloneFormValues>({
    resolver: zodResolver(cloneFormSchema),
    defaultValues: {
      name: `${persona.name} (Clone)`,
      prompt: persona.prompt || "",
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CloneFormValues) => {
    console.log("Starting persona clone process with data:", data);
    setIsSubmitting(true);
    try {
      // Build an enhanced prompt that incorporates the customization notes
      // to ensure the AI model properly applies the customizations
      let enhancedPrompt = data.prompt;
      
      if (data.customization_notes && data.customization_notes.trim() !== "") {
        // Format the customization instructions prominently to ensure they're processed
        enhancedPrompt = `
${data.prompt}

IMPORTANT CUSTOMIZATION INSTRUCTIONS:
${data.customization_notes}

Please create a persona with the above customizations applied. The customizations should significantly influence the persona's traits, behaviors, and responses.
`;
      }
      
      console.log("Generating customized persona with enhanced prompt:", enhancedPrompt);
      
      // Use generatePersona with the enhanced prompt
      const success = await generatePersona(enhancedPrompt);
      
      if (success) {
        console.log("Persona generated successfully");
        toast.success("Customized persona created successfully!");
        
        // Navigate to the persona creation complete page since we don't have the exact persona ID
        navigate("/persona-creation/complete", {
          state: {
            error: false,
            personaName: data.name
          },
          replace: true
        });
        return true;
      } else {
        console.error("Failed to generate persona - no result returned");
        toast.error("Failed to create customized persona");
        return false;
      }
    } catch (error) {
      console.error("Error generating customized persona:", error);
      toast.error("An error occurred while creating the customized persona");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting
  };
}
