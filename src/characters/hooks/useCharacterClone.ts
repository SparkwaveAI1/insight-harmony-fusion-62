
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Character } from "../types/characterTypes";
import { generateCharacterFromFormData } from "../services/characterGenerator";
import { saveCharacter } from "../services/characterService";
import { cloneCharacterFormSchema, CloneCharacterFormValues } from "../components/clone/cloneCharacterFormSchema";

export function useCharacterClone(character: Character) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize form with current character data
  const form = useForm<CloneCharacterFormValues>({
    resolver: zodResolver(cloneCharacterFormSchema),
    defaultValues: {
      name: `${character.name} (Clone)`,
      prompt: character.prompt || "",
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CloneCharacterFormValues) => {
    console.log("Starting character clone process with data:", data);
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to create characters');
      }

      // Build an enhanced prompt that incorporates the customization notes
      let enhancedPrompt = data.prompt;
      
      if (data.customization_notes && data.customization_notes.trim() !== "") {
        enhancedPrompt = `
${data.prompt}

IMPORTANT CUSTOMIZATION INSTRUCTIONS:
${data.customization_notes}

Please create a historical character with the above customizations applied. The customizations should significantly influence the character's traits, behaviors, and historical context.
`;
      }
      
      console.log("Generating customized character with enhanced prompt:", enhancedPrompt);
      
      // Create form data structure for character generation
      const formData = {
        name: data.name,
        historicalPeriod: character.metadata?.historical_period || "1700s",
        region: character.metadata?.region || "Europe",
        occupation: character.metadata?.occupation || "Merchant",
        socialClass: character.metadata?.social_class || "middle",
        age: character.metadata?.age || 35,
        personalityTraits: character.metadata?.personality_traits || [],
        interests: character.metadata?.interests || [],
        goals: character.metadata?.goals || [],
        beliefs: character.metadata?.beliefs || [],
        customPrompt: enhancedPrompt
      };
      
      // Generate the new character
      const generatedCharacter = await generateCharacterFromFormData(formData);
      generatedCharacter.user_id = user.id;
      
      // Store the customization notes in the metadata for reference
      if (generatedCharacter.metadata && data.customization_notes) {
        generatedCharacter.metadata = {
          ...generatedCharacter.metadata,
          customization_notes: data.customization_notes,
          customized_from: character.character_id
        };
      }
      
      // Save character to database
      const savedCharacter = await saveCharacter(generatedCharacter);
      
      console.log("Character generated successfully:", savedCharacter);
      toast.success("Customized character created successfully!");
      
      // Navigate to the new character detail page
      navigate(`/characters/${savedCharacter.character_id}`);
      return true;
    } catch (error) {
      console.error("Error generating customized character:", error);
      toast.error("An error occurred while creating the customized character");
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
