
import { useContext } from 'react';
import { CharacterContext } from '@/context/CharacterProvider';
import { CharacterContextType } from '@/context/CharacterContext.types';

/**
 * Custom hook to access the Character context
 * 
 * @example
 * const { activeCharacter, loadCharacter } = useCharacterHook();
 * 
 * // Load a character
 * useEffect(() => {
 *   if (characterId) {
 *     loadCharacter(characterId);
 *   }
 * }, [characterId, loadCharacter]);
 */
export const useCharacterHook = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  
  if (context === undefined) {
    console.error('useCharacterHook must be used within a CharacterProvider');
    throw new Error('useCharacterHook must be used within a CharacterProvider');
  }
  
  return context;
};
