
// Character module exports - for clean imports
export { default as CharacterDashboard } from './pages/CharacterDashboard';
export { default as CharacterLibrary } from './pages/CharacterLibrary';
export { default as CharactersHome } from './pages/CharactersHome';
export { default as CharacterDetail } from './pages/CharacterDetail';
export { default as CharacterEdit } from './pages/CharacterEdit';
export { default as HistoricalCharacterCreate } from './pages/HistoricalCharacterCreate';
export { default as FictionalCharacterCreate } from './pages/FictionalCharacterCreate';
export { default as HistoricalCharacterForm } from './components/HistoricalCharacterForm';
export { default as HistoricalCharacterHeader } from './components/HistoricalCharacterHeader';
export { default as CharacterTraits } from './components/CharacterTraits';

// Export character trait types (renamed to avoid conflicts)
export * from './types/characterTraitTypes';
export * from './schemas/historicalCharacterSchema';

// Export character services and hooks
export * from './services/characterService';
export * from './services/characterGenerator';
export * from './hooks/useCharacter';
export * from './hooks/useCharacters';
