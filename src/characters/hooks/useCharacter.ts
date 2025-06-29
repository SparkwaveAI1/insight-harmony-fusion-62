
import { useState, useCallback } from 'react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { getCharacterById, getCharacterByCharacterId } from '../services/characterService';
import { getNonHumanoidCharacterById, getNonHumanoidCharacterByCharacterId } from '../services/nonHumanoidCharacterService';
import { toast } from 'sonner';

type AnyCharacter = Character | NonHumanoidCharacter;

export const useCharacter = () => {
  const [activeCharacter, setActiveCharacter] = useState<AnyCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = useCallback(async (characterId: string) => {
    console.log('=== LOADING CHARACTER ===');
    console.log('Character ID:', characterId);
    
    setIsLoading(true);
    setError(null);
    
    try {
      let character: AnyCharacter | null = null;
      
      // Try to load as humanoid character first by character_id
      try {
        character = await getCharacterByCharacterId(characterId);
      } catch (error) {
        console.log('Not found as humanoid character by character_id');
      }
      
      // If not found, try by id
      if (!character) {
        try {
          character = await getCharacterById(characterId);
        } catch (error) {
          console.log('Not found as humanoid character by id');
        }
      }
      
      // If still not found, try non-humanoid by character_id
      if (!character) {
        try {
          character = await getNonHumanoidCharacterByCharacterId(characterId);
        } catch (error) {
          console.log('Not found as non-humanoid character by character_id');
        }
      }
      
      // If still not found, try non-humanoid by id
      if (!character) {
        try {
          character = await getNonHumanoidCharacterById(characterId);
        } catch (error) {
          console.log('Not found as non-humanoid character by id');
        }
      }
      
      if (!character) {
        throw new Error('Character not found');
      }
      
      setActiveCharacter(character);
      console.log('✅ Character loaded successfully:', character.name);
      
      return character;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load character';
      console.error('Error loading character:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCharacter = useCallback(() => {
    setActiveCharacter(null);
    setError(null);
  }, []);

  return {
    activeCharacter,
    isLoading,
    error,
    loadCharacter,
    clearCharacter
  };
};
