
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
      name: `${persona.name} (Customized)`,
      prompt: persona.prompt || "",
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CloneFormValues) => {
    console.log("Starting persona customization process with data:", data);
    setIsSubmitting(true);
    try {
      // Build an enhanced prompt that preserves the original persona's core traits
      // while incorporating the user's customization instructions
      let enhancedPrompt = `
Create a persona based on the following original persona, but with specific customizations applied:

ORIGINAL PERSONA FOUNDATION:
${data.prompt}

PRESERVE THESE CORE CHARACTERISTICS:
- Maintain the same demographic foundation (age, location, background) unless specifically changed
- Keep the same core personality traits and behavioral patterns unless modified
- Retain the linguistic style and communication patterns
- Preserve the trait profile structure and realistic trait distributions

APPLY THESE SPECIFIC CUSTOMIZATIONS:
${data.customization_notes}

IMPORTANT INSTRUCTIONS:
1. Use the original persona as the foundation and apply only the requested customizations
2. Maintain trait realism - ensure all personality traits remain within believable ranges
3. Preserve the psychological coherence of the original persona while integrating changes
4. Keep the same level of detail and depth as the original
5. Ensure the customized traits create a coherent, realistic personality profile
6. Map existing traits accurately, only modifying those specifically requested to change
`;
      
      console.log("Generating customized persona with trait-preserving prompt");
      
      // Use generatePersona with the enhanced trait-preserving prompt
      const generatedPersona = await generatePersona(enhancedPrompt);
      
      if (generatedPersona) {
        console.log("Setting custom name:", data.name);
        
        // Explicitly set the name to the user-specified name from the form
        generatedPersona.name = data.name;
        
        // Store the customization metadata for reference
        if (generatedPersona.metadata) {
          generatedPersona.metadata = {
            ...generatedPersona.metadata,
            customization_notes: data.customization_notes,
            customized_from: persona.persona_id,
            original_persona_name: persona.name,
            customization_date: new Date().toISOString()
          };
        }
        
        console.log("Persona customized successfully with preserved traits:", generatedPersona);
        toast.success(`"${data.name}" created successfully with your customizations!`);
        
        // Navigate to the new persona detail page
        navigate(`/persona/${generatedPersona.persona_id}`);
        return true;
      } else {
        console.error("Failed to generate customized persona - no result returned");
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
