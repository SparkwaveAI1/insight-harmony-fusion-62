
// This file re-exports everything from the other files for backward compatibility
// It can be deprecated once all imports are updated to use the new structure

import { Collection, CollectionWithPersonaCount } from './types';
import {
  getCollectionById,
  getUserCollections,
  getUserCollectionsWithCount,
  createCollection,
  updateCollection,
  deleteCollection
} from './collectionOperations';
import {
  addPersonaToCollection,
  removePersonaFromCollection,
  getPersonasInCollection,
  isPersonaInCollection,
  getPersonasNotInCollection
} from './personaCollectionOperations';

// Re-export everything
export {
  Collection,
  CollectionWithPersonaCount,
  getCollectionById,
  getUserCollections,
  getUserCollectionsWithCount,
  createCollection,
  updateCollection,
  deleteCollection,
  addPersonaToCollection,
  removePersonaFromCollection,
  getPersonasInCollection,
  isPersonaInCollection,
  getPersonasNotInCollection
};
