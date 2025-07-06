
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

  // Create a base prompt from the persona's characteristics
  const createBasePrompt = (persona: Persona): string => {
    if (persona.prompt && persona.prompt.trim() !== '') {
      return persona.prompt;
    }
    
    // Fallback: create a descriptive prompt based on persona data
    const metadata = persona.metadata || {};
    const demographics = [];
    
    if (metadata.age) demographics.push(`${metadata.age} years old`);
    if (metadata.gender) demographics.push(metadata.gender);
    if (metadata.location) demographics.push(`from ${metadata.location}`);
    if (metadata.occupation) demographics.push(`working as ${metadata.occupation}`);
    if (metadata.education) demographics.push(`${metadata.education} education`);
    
    const demographicString = demographics.length > 0 ? demographics.join(', ') : 'individual';
    
    return `Create a detailed persona representing a ${demographicString} named ${persona.name}. This person should have realistic personality traits, behavioral patterns, and decision-making processes that reflect their background and life experiences.`;
  };

  // Initialize form with current persona data
  const form = useForm<CloneFormValues>({
    resolver: zodResolver(cloneFormSchema),
    defaultValues: {
      name: `${persona.name} (Clone)`,
      prompt: createBasePrompt(persona),
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CloneFormValues) => {
    console.log("Starting persona clone process with data:", data);
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!data.customization_notes || data.customization_notes.trim() === '') {
        toast.error("Please provide customization instructions to make your new persona unique");
        return false;
      }
      
      if (!data.name || data.name.trim() === '') {
        toast.error("Please provide a name for your new persona");
        return false;
      }
      
      // Build an enhanced prompt that preserves original traits while applying customizations
      const enhancedPrompt = `Create a persona based on the following foundation, applying the specified customizations:

FOUNDATION PERSONA:
${data.prompt}

TRAIT PRESERVATION (maintain these core characteristics):
- Demographics: ${JSON.stringify(persona.metadata || {})}
- Personality traits: ${JSON.stringify(persona.trait_profile || {})}
- Communication style: ${JSON.stringify(persona.linguistic_profile || {})}
- Emotional patterns: ${JSON.stringify(persona.emotional_triggers || {})}

CUSTOMIZATIONS TO APPLY:
${data.customization_notes}

INSTRUCTIONS:
Create a new persona that maintains the core foundation but incorporates the requested customizations. The result should feel like a natural evolution of the original persona with the new characteristics seamlessly integrated.`;
      
      console.log("Generating persona with enhanced prompt");
      
      // Generate the new persona
      const generatedPersona = await generatePersona(enhancedPrompt);
      
      if (generatedPersona) {
        // Override the generated name with the user-specified name
        generatedPersona.name = data.name;
        
        // Add metadata about the customization
        if (generatedPersona.metadata) {
          generatedPersona.metadata = {
            ...generatedPersona.metadata,
            customization_notes: data.customization_notes,
            customized_from: persona.persona_id,
            clone_source: "trait_preserving_clone",
            original_persona_name: persona.name
          };
        }
        
        console.log("Persona cloned successfully:", generatedPersona.name);
        toast.success(`"${generatedPersona.name}" created successfully!`);
        
        // Navigate to the new persona
        navigate(`/persona/${generatedPersona.persona_id}`);
        return true;
      } else {
        console.error("Failed to generate persona");
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
