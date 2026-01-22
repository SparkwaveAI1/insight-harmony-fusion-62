
// This file re-exports everything from the other files for backward compatibility
// It can be deprecated once all imports are updated to use the new structure

import {
  getCollectionById,
  getUserCollections,
  getPublicCollections,
  getUserCollectionsWithCount,
  getPublicCollectionsWithCount,
  createCollection,
  updateCollection,
  deleteCollection,
  getAllAccessibleCollections
} from './collectionOperations';
import {
  addPersonaToCollection,
  removePersonaFromCollection,
  getPersonasInCollection,
  isPersonaInCollection,
  getPersonasNotInCollection
} from './personaCollectionOperations';
import type { Collection, CollectionWithPersonaCount } from './types';

// Re-export types with 'export type'
export type { Collection, CollectionWithPersonaCount };

// Re-export functions
export {
  getCollectionById,
  getUserCollections,
  getPublicCollections,
  getUserCollectionsWithCount,
  getPublicCollectionsWithCount,
  createCollection,
  updateCollection,
  deleteCollection,
  getAllAccessibleCollections,
  addPersonaToCollection,
  removePersonaFromCollection,
  getPersonasInCollection,
  isPersonaInCollection,
  getPersonasNotInCollection
};
