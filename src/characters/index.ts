
// Re-export all functions from the operations
export { 
  getCharacterById, 
  getCharacterByCharacterId, 
  getAllCharacters 
} from './services/characterService';
export { 
  updateCharacterVisibility, 
  updateCharacterName,
  updateCharacterProfileImageUrl 
} from './services/characterService';
export { deleteCharacter } from './services/characterService';
export { cloneCharacter } from './services/characterService';
export { 
  generateCharacter, 
  generateHistoricalCharacter,
  generateCharacterFromFormData 
} from './services/characterGenerator';
export { generateCharacterImage } from './services/characterImageService';

// Re-export types
export type { Character, CharacterTraitProfile } from './types/characterTraitTypes';
export type { Message, ChatMode } from './types/chatTypes';

// Re-export hooks
export { useCharacterHook } from './hooks/useCharacterHook';
export { useCharacterChat } from './hooks/useCharacterChat';
export { useCharacter } from './hooks/useCharacter';
export { useCharacters } from './hooks/useCharacters';

// Re-export page components
export { default as CharacterDashboard } from './pages/CharacterDashboard';
export { default as CharacterDetail } from './pages/CharacterDetail';
export { default as CharacterEdit } from './pages/CharacterEdit';
export { default as CharacterLibrary } from './pages/CharacterLibrary';

// Re-export components
export { default as CharacterCloneForm } from './components/CharacterCloneForm';
