
import { Character } from "@/characters/types/characterTraitTypes";

export interface CharacterContextType {
  // All characters
  characters: Character[];
  
  // Update characters
  setCharacters: (characters: Character[]) => void;
  
  // Current active character
  activeCharacter: Character | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: Error | null;
  
  // Multiple characters for group scenarios
  activeCharacters: Character[];
  
  // Methods
  loadCharacter: (characterId: string) => Promise<Character | null>;
  loadMultipleCharacters: (characterIds: string[]) => Promise<Character[]>;
  clearCharacter: () => void;
  clearCharacters: () => void;
}
