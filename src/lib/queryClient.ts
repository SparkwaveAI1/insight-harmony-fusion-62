/**
 * React Query Client Configuration
 * 
 * Centralized query client with caching defaults for PersonaAI.
 * Caching strategy:
 * - Persona data: 5 minutes (stable, changes infrequently)
 * - User profile/credits: 1 minute (needs to stay current)
 * - Conversation list: 30 seconds (changes frequently)
 * - Search results: 2 minutes (reasonable for exploration)
 */

import { QueryClient } from '@tanstack/react-query';

// Cache time constants (in milliseconds)
export const CACHE_TIMES = {
  PERSONA_DATA: 5 * 60 * 1000,      // 5 minutes
  USER_PROFILE: 1 * 60 * 1000,       // 1 minute
  CREDITS: 1 * 60 * 1000,            // 1 minute
  CONVERSATION_LIST: 30 * 1000,      // 30 seconds
  SEARCH_RESULTS: 2 * 60 * 1000,     // 2 minutes
  COLLECTIONS: 5 * 60 * 1000,        // 5 minutes
} as const;

// Stale time constants (when data becomes "stale" and will refetch in background)
export const STALE_TIMES = {
  PERSONA_DATA: 3 * 60 * 1000,       // 3 minutes
  USER_PROFILE: 30 * 1000,           // 30 seconds
  CREDITS: 30 * 1000,                // 30 seconds
  CONVERSATION_LIST: 10 * 1000,      // 10 seconds
  SEARCH_RESULTS: 1 * 60 * 1000,     // 1 minute
  COLLECTIONS: 3 * 60 * 1000,        // 3 minutes
} as const;

// Query key factories for consistent key generation
export const queryKeys = {
  // Persona-related keys
  personas: {
    all: ['personas'] as const,
    lists: () => [...queryKeys.personas.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.personas.lists(), filters] as const,
    details: () => [...queryKeys.personas.all, 'detail'] as const,
    detail: (personaId: string) => [...queryKeys.personas.details(), personaId] as const,
    myPersonas: (userId: string) => ['my-personas-show-all', userId] as const,
    publicPersonas: () => ['public-personas-show-all'] as const,
  },
  
  // User-related keys
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    credits: (userId: string) => [...queryKeys.user.all, 'credits', userId] as const,
    apiKeys: (userId: string) => [...queryKeys.user.all, 'apiKeys', userId] as const,
  },
  
  // Conversation-related keys
  conversations: {
    all: ['conversations'] as const,
    lists: () => [...queryKeys.conversations.all, 'list'] as const,
    list: (userId: string, personaId?: string) => 
      personaId 
        ? [...queryKeys.conversations.lists(), userId, personaId] as const
        : [...queryKeys.conversations.lists(), userId] as const,
    detail: (conversationId: string) => [...queryKeys.conversations.all, 'detail', conversationId] as const,
    messages: (conversationId: string) => [...queryKeys.conversations.all, 'messages', conversationId] as const,
  },
  
  // Search-related keys
  search: {
    all: ['search'] as const,
    personas: (query: string) => [...queryKeys.search.all, 'personas', query] as const,
    semantic: (query: string) => [...queryKeys.search.all, 'semantic', query] as const,
    collections: (query: string) => [...queryKeys.search.all, 'collections', query] as const,
  },
  
  // Collection-related keys
  collections: {
    all: ['collections'] as const,
    list: () => [...queryKeys.collections.all, 'list'] as const,
    detail: (collectionId: string) => [...queryKeys.collections.all, 'detail', collectionId] as const,
    personas: (collectionId: string) => [...queryKeys.collections.all, 'personas', collectionId] as const,
  },
  
  // Billing-related keys
  billing: {
    all: ['billing'] as const,
    plans: () => [...queryKeys.billing.all, 'plans'] as const,
    profile: (userId: string) => [...queryKeys.billing.all, 'profile', userId] as const,
    transactions: (userId: string) => [...queryKeys.billing.all, 'transactions', userId] as const,
  },
} as const;

/**
 * Create the query client with optimized defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time (data considered fresh for this duration)
        staleTime: STALE_TIMES.PERSONA_DATA,
        
        // Default cache time (data kept in cache after becoming inactive)
        gcTime: CACHE_TIMES.PERSONA_DATA,
        
        // Retry failed queries with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        
        // Don't refetch on window focus by default (reduces API calls)
        refetchOnWindowFocus: false,
        
        // Don't refetch on reconnect unless stale
        refetchOnReconnect: 'always',
        
        // Show stale data while revalidating
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Export a singleton instance for use throughout the app
export const queryClient = createQueryClient();

/**
 * Invalidate all persona-related queries
 * Useful after creating, updating, or deleting a persona
 */
export function invalidatePersonaQueries(client: QueryClient = queryClient) {
  client.invalidateQueries({ queryKey: queryKeys.personas.all });
}

/**
 * Invalidate all user-related queries
 * Useful after auth state changes
 */
export function invalidateUserQueries(client: QueryClient = queryClient, userId?: string) {
  if (userId) {
    client.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
    client.invalidateQueries({ queryKey: queryKeys.user.credits(userId) });
  } else {
    client.invalidateQueries({ queryKey: queryKeys.user.all });
  }
}

/**
 * Invalidate credit balance specifically
 * Useful after purchases or credit usage
 */
export function invalidateCreditsQuery(client: QueryClient = queryClient, userId: string) {
  client.invalidateQueries({ queryKey: queryKeys.user.credits(userId) });
}

/**
 * Invalidate conversation queries
 * Useful after sending messages or starting new conversations
 */
export function invalidateConversationQueries(client: QueryClient = queryClient, conversationId?: string) {
  if (conversationId) {
    client.invalidateQueries({ queryKey: queryKeys.conversations.detail(conversationId) });
    client.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId) });
  }
  client.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
}

/**
 * Prefetch persona data for faster navigation
 */
export async function prefetchPersona(
  client: QueryClient,
  personaId: string,
  fetchFn: () => Promise<unknown>
) {
  await client.prefetchQuery({
    queryKey: queryKeys.personas.detail(personaId),
    queryFn: fetchFn,
    staleTime: STALE_TIMES.PERSONA_DATA,
  });
}
