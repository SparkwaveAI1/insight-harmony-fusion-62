// Export types
export type * from './types';

// Export collection operations
export * from './collectionOperations';

// Export persona-collection operations
export * from './personaCollectionOperations';

// Export project operations
export * from './projectOperations';

// Export project-collection operations
export * from './projectCollectionOperations';

// Export knowledge base operations (excluding types to avoid duplicate exports)
export { 
  uploadKnowledgeBaseDocument,
  getProjectDocuments,
  deleteKnowledgeBaseDocument,
  type KnowledgeBaseDocument
} from './knowledgeBaseOperations';

// Export conversation operations
export * from './conversationOperations';

// For backwards compatibility
export * from './collectionsService';

export { getProjectConversations } from './conversationOperations';

// Export research operations
export * from './researchOperations';
