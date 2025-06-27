
import { useState } from 'react';
import { Character } from '../types/characterTraitTypes';
import { getCharacterById } from '../services/characterService';

export const useCharacter = () => {
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = async (characterId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading character:', characterId);
      const character = await getCharacterById(characterId);
      
      if (!character) {
        throw new Error('Character not found');
      }
      
      setActiveCharacter(character);
      console.log('Character loaded successfully:', character.name);
    } catch (err) {
      console.error('Error loading character:', err);
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeCharacter,
    isLoading,
    error,
    loadCharacter,
  };
};
