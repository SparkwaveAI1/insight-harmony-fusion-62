
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Character } from "../../types/characterTraitTypes";
import { cloneCharacter } from "../../services/characterService";
import { cloneFormSchema, CloneFormValues } from "./cloneFormSchema";

export function useCharacterClone(character: Character) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize form with current character data
  const form = useForm<CloneFormValues>({
    resolver: zodResolver(cloneFormSchema),
    defaultValues: {
      name: `${character.name} (Clone)`,
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CloneFormValues) => {
    console.log("Starting character clone process with data:", data);
    setIsSubmitting(true);
    try {
      console.log("Cloning character with customizations:", data);
      
      // Use the cloneCharacter service function
      const clonedCharacter = await cloneCharacter(character, {
        name: data.name,
        customization_notes: data.customization_notes,
      });
      
      if (clonedCharacter) {
        console.log("Character cloned successfully:", clonedCharacter);
        toast.success("Character cloned successfully!");
        
        // Navigate to the new character detail page
        navigate(`/characters/${clonedCharacter.character_id}`);
        return true;
      } else {
        console.error("Failed to clone character - no result returned");
        toast.error("Failed to clone character");
        return false;
      }
    } catch (error) {
      console.error("Error cloning character:", error);
      toast.error("An error occurred while cloning the character");
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
