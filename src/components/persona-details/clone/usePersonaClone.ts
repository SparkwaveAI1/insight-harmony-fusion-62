
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Persona } from "@/services/persona/types";
import { generatePersona } from "@/services/persona";
import { cloneFormSchema, CloneFormValues } from "./cloneFormSchema";

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
      // Create a modified prompt with the customization notes appended
      let fullPrompt = data.prompt;
      
      if (data.customization_notes) {
        fullPrompt = `${fullPrompt}\n\nCustomization: ${data.customization_notes}`;
      }
      
      console.log("Generating new customized persona with prompt:", fullPrompt);
      
      // Use generatePersona instead of clonePersona to create a truly new persona
      const generatedPersona = await generatePersona(fullPrompt);
      
      if (generatedPersona) {
        // Update the name to the user-specified name
        generatedPersona.name = data.name;
        
        console.log("Persona generated successfully:", generatedPersona);
        toast.success("Customized persona created successfully!");
        
        // Navigate to the new persona detail page
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
