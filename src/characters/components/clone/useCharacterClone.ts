
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Character } from "../../types/characterTraitTypes";
import { NonHumanoidCharacter } from "../../types/nonHumanoidTypes";
import { createCreativeCharacter } from "../../services/creativeCharacterService";
import { generateCharacterTraits } from "../../services/characterTraitService";
import { saveCharacter } from "../../services/characterService";
import { cloneFormSchema, CloneFormValues } from "./cloneFormSchema";
import { useAuth } from "@/context/AuthContext";

export function useCharacterClone(character: Character | NonHumanoidCharacter) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    
    if (!user) {
      toast.error('Please sign in to clone characters');
      navigate('/sign-in');
      return false;
    }

    if (!data.customization_notes || data.customization_notes.trim() === '') {
      toast.warning("Please provide customization instructions to make your cloned character unique");
      return false;
    }
    
    if (!data.name || data.name.trim() === '') {
      toast.warning("Please provide a name for your cloned character");
      return false;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Cloning character with customizations:", data);
      
      let clonedCharacter: Character | NonHumanoidCharacter;
      
      // Handle different character types
      if (character.character_type === 'historical') {
        clonedCharacter = await cloneHistoricalCharacter(character as Character, data, user.id);
      } else if (character.character_type === 'multi_species' || 'species_type' in character) {
        clonedCharacter = await cloneCreativeCharacter(character, data, user.id);
      } else if (character.character_type === 'fictional') {
        clonedCharacter = await cloneCreativeCharacter(character, data, user.id);
      } else {
        // Fallback to generic cloning
        clonedCharacter = await cloneGenericCharacter(character as Character, data, user.id);
      }
      
      if (clonedCharacter) {
        console.log("Character cloned successfully:", clonedCharacter);
        toast.success("Character cloned and customized successfully!");
        
        // Navigate to the appropriate library based on character type
        if (clonedCharacter.character_type === 'multi_species' || 'species_type' in clonedCharacter) {
          navigate('/characters/creative');
        } else {
          navigate(`/characters/${clonedCharacter.character_id}`);
        }
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

// Clone historical character using historical character creation process
const cloneHistoricalCharacter = async (
  character: Character, 
  customizations: CloneFormValues, 
  userId: string
): Promise<Character> => {
  console.log('Cloning historical character with historical process');
  
  // Build customized description for historical character
  const originalDescription = character.metadata?.description || '';
  const fullDescription = `${originalDescription}\n\nCustomization: ${customizations.customization_notes}`;
  
  // Generate new traits using historical character creation process
  const historicalData = {
    name: customizations.name,
    description: fullDescription,
    date_of_birth: character.metadata?.date_of_birth || '1800-01-01',
    age: character.metadata?.age || 30,
    location: character.metadata?.location || '',
    gender: character.metadata?.gender || '',
    ethnicity: character.metadata?.ethnicity || '',
    social_class: character.metadata?.social_class || '',
    region: character.metadata?.region || '',
    occupation: character.metadata?.occupation || '',
    personality_traits: character.metadata?.personality_traits || '',
    backstory: fullDescription,
    historical_context: character.metadata?.historical_context || ''
  };
  
  const newTraits = await generateCharacterTraits(historicalData);
  
  // Create new historical character
  const clonedCharacter: Character = {
    ...character,
    character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: customizations.name,
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: userId,
    is_public: false,
    profile_image_url: null,
    trait_profile: newTraits,
    metadata: {
      ...character.metadata,
      description: fullDescription,
      customization_notes: customizations.customization_notes,
      cloned_from: character.character_id,
      created_via: 'historical_clone'
    }
  };
  
  return await saveCharacter(clonedCharacter);
};

// Clone creative character using creative character creation process
const cloneCreativeCharacter = async (
  character: Character | NonHumanoidCharacter, 
  customizations: CloneFormValues, 
  userId: string
): Promise<Character | NonHumanoidCharacter> => {
  console.log('Cloning creative character with creative process');
  
  // Extract creative data from the original character
  const originalDescription = character.metadata?.description || '';
  const fullDescription = `${originalDescription}\n\nCustomization: ${customizations.customization_notes}`;
  
  const creativeData = {
    name: customizations.name,
    entityType: character.metadata?.entity_type || ('species_type' in character ? 'non-humanoid' : 'humanoid'),
    narrativeDomain: character.metadata?.narrative_domain || character.origin_universe || 'modern',
    functionalRole: character.metadata?.functional_role || 'character',
    description: fullDescription,
    environment: character.metadata?.environment || 'contemporary',
    physicalForm: character.metadata?.physical_form || '',
    communication: character.metadata?.communication || 'verbal',
    coreDrives: character.metadata?.core_drives || ['survival'],
    surfaceTriggers: character.metadata?.surface_triggers || ['conflict'],
    changeResponseStyle: character.metadata?.change_response_style || 'mutate_adapt'
  };
  
  return await createCreativeCharacter(creativeData, userId);
};

// Generic character cloning as fallback
const cloneGenericCharacter = async (
  character: Character, 
  customizations: CloneFormValues, 
  userId: string
): Promise<Character> => {
  console.log('Cloning character with generic process');
  
  const clonedCharacter: Character = {
    ...character,
    character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: customizations.name,
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: userId,
    is_public: false,
    profile_image_url: null,
    metadata: {
      ...character.metadata,
      customization_notes: customizations.customization_notes,
      cloned_from: character.character_id
    }
  };
  
  return await saveCharacter(clonedCharacter);
};
