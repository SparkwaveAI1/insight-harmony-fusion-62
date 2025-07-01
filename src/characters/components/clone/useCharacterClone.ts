
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
        clonedCharacter = await cloneEnhancedCreativeCharacter(character, data, user.id);
      } else if (character.character_type === 'fictional') {
        clonedCharacter = await cloneEnhancedCreativeCharacter(character, data, user.id);
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

// Enhanced cloning for Character Lab characters that preserves all trait architecture
const cloneEnhancedCreativeCharacter = async (
  character: Character | NonHumanoidCharacter, 
  customizations: CloneFormValues, 
  userId: string
): Promise<Character | NonHumanoidCharacter> => {
  console.log('Cloning Character Lab character with enhanced preservation');
  
  // Preserve all original trait profile data and enhance it
  const originalTraitProfile = character.trait_profile || {};
  const originalDescription = character.metadata?.description || originalTraitProfile.description || '';
  const fullDescription = `${originalDescription}\n\nCustomization: ${customizations.customization_notes}`;
  
  // Build enhanced trait profile preserving all original data
  const enhancedTraitProfile = {
    // Preserve all original trait profile data
    ...originalTraitProfile,
    
    // Update description with customizations
    description: fullDescription,
    
    // Ensure core Character Lab fields are present
    entity_type: originalTraitProfile.entity_type || 'non-humanoid',
    narrative_domain: originalTraitProfile.narrative_domain || 'sci-fi',
    functional_role: originalTraitProfile.functional_role || 'character',
    environment: originalTraitProfile.environment || 'contemporary',
    physical_form: originalTraitProfile.physical_form || '',
    communication_method: originalTraitProfile.communication_method || 'verbal',
    
    // Preserve or enhance core drives and triggers
    core_drives: originalTraitProfile.core_drives || ['survival'],
    surface_triggers: originalTraitProfile.surface_triggers || ['conflict'],
    change_response_style: originalTraitProfile.change_response_style || 'mutate_adapt',
    
    // Preserve creative personality traits
    creative_personality: originalTraitProfile.creative_personality || {
      imagination_level: 0.7,
      expressiveness: 0.6,
      social_comfort: 0.5,
      collaborative_nature: 0.6,
      emotional_depth: 0.7
    },
    
    // Preserve decision approach
    decision_approach: originalTraitProfile.decision_approach || {
      conflict_style: originalTraitProfile.change_response_style || 'mutate_adapt',
      adaptability: 0.6,
      change_threshold: 0.5
    },
    
    // Preserve enhanced Character Lab models if they exist
    cognition_model: originalTraitProfile.cognition_model || {},
    constraint_model: originalTraitProfile.constraint_model || {},
    evolution_model: originalTraitProfile.evolution_model || {},
    appearance_model: originalTraitProfile.appearance_model || {},
    
    // Add customization metadata
    customization_applied: true,
    customization_notes: customizations.customization_notes,
    cloned_from: character.character_id,
    clone_timestamp: new Date().toISOString()
  };
  
  // Create cloned character preserving all structure
  const clonedCharacter = {
    ...character,
    character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: customizations.name,
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: userId,
    is_public: false,
    profile_image_url: null,
    
    // Enhanced trait profile with all original data preserved
    trait_profile: enhancedTraitProfile,
    
    // Preserve behavioral modulation
    behavioral_modulation: character.behavioral_modulation || {
      formality: 0.5,
      enthusiasm: 0.6,
      assertiveness: 0.5,
      empathy: 0.7,
      patience: 0.6
    },
    
    // Preserve linguistic profile
    linguistic_profile: character.linguistic_profile || {
      default_output_length: 'medium',
      speech_register: 'contextual',
      cultural_speech_patterns: 'entity-appropriate'
    },
    
    // Enhanced metadata
    metadata: {
      ...character.metadata,
      description: fullDescription,
      customization_notes: customizations.customization_notes,
      cloned_from: character.character_id,
      created_via: 'enhanced_creative_clone',
      clone_timestamp: new Date().toISOString()
    },
    
    // Preserve other Character Lab specific fields
    interview_sections: character.interview_sections || [],
    preinterview_tags: character.preinterview_tags || [],
    simulation_directives: character.simulation_directives || {
      roleplay_style: 'immersive',
      consistency_level: 'high',
      evolution_enabled: true
    },
    
    // Preserve emotional triggers for Character Lab characters
    emotional_triggers: character.emotional_triggers || {
      positive_triggers: [],
      negative_triggers: []
    }
  };
  
  console.log('Enhanced cloned character:', clonedCharacter);
  return await saveCharacter(clonedCharacter as Character);
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
