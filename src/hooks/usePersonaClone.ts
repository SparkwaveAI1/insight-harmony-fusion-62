
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

  // Create a base prompt from the persona's characteristics if the original prompt is missing
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
      // Build an enhanced prompt that incorporates the original persona traits
      // and applies the user's customizations on top
      let enhancedPrompt = `Create a persona based on the following original persona, but with specific customizations applied:

ORIGINAL PERSONA PROMPT:
${data.prompt}

TRAIT PRESERVATION INSTRUCTIONS:
- Preserve the core demographic information: ${JSON.stringify(persona.metadata || {})}
- Maintain the overall personality structure from these trait profiles: ${JSON.stringify(persona.trait_profile || {})}
- Keep the communication style and linguistic patterns: ${JSON.stringify(persona.linguistic_profile || {})}
- Retain positive emotional triggers: ${JSON.stringify(persona.emotional_triggers?.positive_triggers || [])}

CUSTOMIZATION INSTRUCTIONS (APPLY THESE CHANGES):
${data.customization_notes}

IMPORTANT: The resulting persona should feel like a natural evolution of the original, with the customizations seamlessly integrated into the existing personality structure. Maintain internal consistency while applying the requested changes.`;
      
      console.log("Generating customized persona with enhanced prompt:", enhancedPrompt);
      
      // Use generatePersona with the enhanced prompt that preserves traits
      const generatedPersona = await generatePersona(enhancedPrompt);
      
      if (generatedPersona) {
        console.log("Original name from form:", data.name);
        console.log("Before name update, persona has name:", generatedPersona.name);
        
        // Explicitly set the name to the user-specified name from the form
        generatedPersona.name = data.name;
        
        console.log("After name update, persona now has name:", generatedPersona.name);
        
        // Store the customization metadata for reference
        if (generatedPersona.metadata) {
          generatedPersona.metadata = {
            ...generatedPersona.metadata,
            customization_notes: data.customization_notes,
            customized_from: persona.persona_id,
            clone_source: "trait_preserving_clone",
            original_persona_name: persona.name
          };
        }
        
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
