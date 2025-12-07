import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface SemanticSearchResult {
  persona_id: string;
  name: string;
  similarity: number;
  similarity_percent: number;
  demographics: {
    age: number | null;
    gender: string | null;
    occupation: string | null;
    location: string;
  };
  profile_image_url: string | null;
  preview_summary: string | null;
}

interface UseSemanticSearchOptions {
  threshold?: number;
  maxResults?: number;
  filterCollectionId?: string;
  excludeCollectionId?: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseSemanticSearchReturn {
  results: SemanticSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useSemanticPersonaSearch(
  query: string,
  options: UseSemanticSearchOptions = {}
): UseSemanticSearchReturn {
  const {
    threshold = 0.3,
    maxResults = 50,
    filterCollectionId,
    excludeCollectionId,
    enabled = true,
    debounceMs = 300,
  } = options;

  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'semantic-persona-search',
        {
          body: {
            query: searchQuery.trim(),
            match_threshold: threshold,
            max_results: maxResults,
            filter_collection_id: filterCollectionId || undefined,
            exclude_collection_id: excludeCollectionId || undefined,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.personas || []);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [threshold, maxResults, filterCollectionId, excludeCollectionId]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      search(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, enabled, search]);

  return { results, isLoading, error, search, clearResults };
}
