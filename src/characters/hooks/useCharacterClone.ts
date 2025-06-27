
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Character } from "../types/characterTraitTypes";
import { CharacterCloneFormValues, characterCloneFormSchema } from "../schemas/characterCloneSchema";
import { generateCharacterFromFormData } from "../services/characterGenerator";
import { saveCharacter } from "../services/characterService";
import { supabase } from "@/integrations/supabase/client";

export const useCharacterClone = (character: Character) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CharacterCloneFormValues>({
    resolver: zodResolver(characterCloneFormSchema),
    defaultValues: {
      name: "",
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CharacterCloneFormValues): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      console.log('Cloning character with customizations:', data);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to clone characters');
      }

      // Create a detailed prompt for the character cloning
      const clonePrompt = `Create a customized version of this character: ${character.name}

Original Character Details:
- Name: ${character.name}
- Type: ${character.character_type}
- Background: ${character.metadata?.description || 'Historical character'}
- Traits: ${JSON.stringify(character.trait_profile, null, 2)}
- Demographics: ${JSON.stringify(character.metadata, null, 2)}

Customization Instructions: ${data.customization_notes}

New Character Name: ${data.name}

Please generate a new character that builds upon the original but incorporates the requested customizations. Maintain the core essence while implementing the specific changes requested.`;

      // Use the existing character generation system with the clone prompt
      const newCharacter = await generateCharacterFromFormData({
        name: data.name,
        date_of_birth: character.metadata?.age ? `${new Date().getFullYear() - parseInt(character.metadata.age)}` : '1900',
        age: character.metadata?.age || '25',
        location: character.metadata?.region || 'Unknown',
        occupation: character.metadata?.occupation || 'Historical figure',
        backstory: clonePrompt,
        personality_traits: data.customization_notes,
        historical_context: `Customized version of ${character.name}`
      });

      newCharacter.user_id = user.id;
      newCharacter.character_type = character.character_type;
      
      // Save the cloned character
      const savedCharacter = await saveCharacter(newCharacter);
      
      console.log('✅ Character cloned successfully:', savedCharacter);
      toast.success(`Character "${data.name}" created successfully!`);
      
      // Navigate to the new character's details page
      navigate(`/characters/${savedCharacter.character_id}`);
      
      return true;
    } catch (error) {
      console.error('Error cloning character:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to clone character');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
  };
};
