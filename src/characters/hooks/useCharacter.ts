
import { useState, useCallback } from 'react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { getAnyCharacterById, getAnyCharacterByCharacterId, UnifiedCharacter } from '../services/unifiedCharacterService';
import { toast } from 'sonner';

export const useCharacter = () => {
  const [activeCharacter, setActiveCharacter] = useState<UnifiedCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = useCallback(async (characterId: string) => {
    console.log('=== LOADING CHARACTER ===');
    console.log('Character ID:', characterId);
    
    setIsLoading(true);
    setError(null);
    
    try {
      let character: UnifiedCharacter | null = null;
      
      // Try to load by character_id first, then by id
      character = await getAnyCharacterByCharacterId(characterId);
      
      if (!character) {
        character = await getAnyCharacterById(characterId);
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
