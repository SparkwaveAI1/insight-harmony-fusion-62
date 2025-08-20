
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
      const generatedPersona = await generatePersona(enhancedPrompt);
      
      if (generatedPersona) {
        console.log("Original name from form:", data.name);
        console.log("Before name update, persona has name:", generatedPersona.name);
        
        // Explicitly set the name to the user-specified name from the form
        generatedPersona.name = data.name;
        
        console.log("After name update, persona now has name:", generatedPersona.name);
        
        // Store the customization notes in the metadata for reference
        if (generatedPersona.metadata && data.customization_notes) {
          generatedPersona.metadata = {
            ...generatedPersona.metadata,
            customization_notes: data.customization_notes,
            customized_from: persona.persona_id
          };
        }
        
        console.log("Persona generated successfully:", generatedPersona);
        toast.success("Customized persona created successfully!");
        
        // Navigate to the new persona detail page with the correct path
        navigate(`/persona/${generatedPersona.persona_id}`);
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
