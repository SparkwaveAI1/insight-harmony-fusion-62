
import { useState, useCallback } from 'react';
import { Character } from '../types/characterTraitTypes';
import { getCharacterById, getCharacterByCharacterId } from '../services/unifiedCharacterService';
import { toast } from 'sonner';

export const useCharacter = () => {
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = useCallback(async (characterId: string) => {
    console.log('=== LOADING UNIFIED CHARACTER ===');
    console.log('Character ID:', characterId);
    
    setIsLoading(true);
    setError(null);
    
    try {
      let character: Character | null = null;
      
      // Try to load by character_id first
      try {
        character = await getCharacterByCharacterId(characterId);
      } catch (error) {
        console.log('Not found by character_id, trying by id');
      }
      
      // If not found, try by id
      if (!character) {
        try {
          character = await getCharacterById(characterId);
        } catch (error) {
          console.log('Not found by id either');
        }
      }
      
      if (!character) {
        throw new Error('Character not found');
      }
      
      setActiveCharacter(character);
      console.log('✅ Unified character loaded successfully:', character.name);
      
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
