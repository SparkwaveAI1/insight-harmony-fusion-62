
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Persona } from "@/services/persona/types";
import { clonePersona } from "@/services/persona";
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
      // Create a simplified clone of the persona with just the basic information
      const customizedPersona: Partial<Persona> = {
        name: data.name,
        prompt: data.prompt,
        metadata: persona.metadata,
        interview_sections: persona.interview_sections,
        trait_profile: persona.trait_profile,
        linguistic_profile: persona.linguistic_profile,
        behavioral_modulation: persona.behavioral_modulation || {},
        preinterview_tags: persona.preinterview_tags || [],
        simulation_directives: persona.simulation_directives || {},
        // Reset the persona_id and creation_date for the clone
        persona_id: "", // Will be generated on the server
        creation_date: new Date().toISOString().split('T')[0],
      };

      // Append customization notes to the prompt if provided
      if (data.customization_notes) {
        customizedPersona.prompt = `${customizedPersona.prompt}\n\nCustomization Notes: ${data.customization_notes}`;
      }

      console.log("Sending customized persona for cloning:", customizedPersona);
      // Save the cloned persona
      const clonedPersona = await clonePersona(customizedPersona as Persona);
      
      if (clonedPersona) {
        console.log("Persona cloned successfully:", clonedPersona);
        toast.success("Persona cloned successfully!");
        // Navigate to the new persona detail page
        navigate(`/persona/${clonedPersona.persona_id}`);
        return true;
      } else {
        console.error("Failed to clone persona - no result returned");
        toast.error("Failed to clone persona");
        return false;
      }
    } catch (error) {
      console.error("Error cloning persona:", error);
      toast.error("An error occurred while cloning the persona");
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
