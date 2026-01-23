// src/hooks/usePersonaFilterOptions.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PersonaFilterOptions {
  genders: string[];
  ethnicities: string[];
  states: string[];
  countries: string[];
  education_levels: string[];
  income_brackets: string[];
  marital_statuses: string[];
  interest_tags: string[];
  health_tags: string[];
  work_role_tags: string[];
  political_leans: string[];
}

const DEFAULT_OPTIONS: PersonaFilterOptions = {
  genders: [],
  ethnicities: [],
  states: [],
  countries: [],
  education_levels: [],
  income_brackets: [],
  marital_statuses: [],
  interest_tags: [],
  health_tags: [],
  work_role_tags: [],
  political_leans: [],
};

// Cache the options to avoid repeated fetches
let cachedOptions: PersonaFilterOptions | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function usePersonaFilterOptions() {
  const [options, setOptions] = useState<PersonaFilterOptions>(
    cachedOptions || DEFAULT_OPTIONS
  );
  const [isLoading, setIsLoading] = useState(!cachedOptions);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      // Return cached if still valid
      if (cachedOptions && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setOptions(cachedOptions);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error: rpcError } = await supabase.rpc('get_persona_filter_options');

        if (rpcError) throw rpcError;

        if (data) {
          // Type assertion for the RPC response
          const rpcData = data as Record<string, unknown>;
          
          const fetchedOptions: PersonaFilterOptions = {
            genders: Array.isArray(rpcData.genders) ? rpcData.genders : [],
            ethnicities: Array.isArray(rpcData.ethnicities) ? rpcData.ethnicities : [],
            states: Array.isArray(rpcData.states) ? rpcData.states : [],
            countries: Array.isArray(rpcData.countries) ? rpcData.countries : [],
            education_levels: Array.isArray(rpcData.education_levels) ? rpcData.education_levels : [],
            income_brackets: Array.isArray(rpcData.income_brackets) ? rpcData.income_brackets : [],
            marital_statuses: Array.isArray(rpcData.marital_statuses) ? rpcData.marital_statuses : [],
            interest_tags: Array.isArray(rpcData.interest_tags) ? rpcData.interest_tags : [],
            health_tags: Array.isArray(rpcData.health_tags) ? rpcData.health_tags : [],
            work_role_tags: Array.isArray(rpcData.work_role_tags) ? rpcData.work_role_tags : [],
            political_leans: Array.isArray(rpcData.political_leans) ? rpcData.political_leans : [],
          };

          // Update cache
          cachedOptions = fetchedOptions;
          cacheTimestamp = Date.now();

          setOptions(fetchedOptions);
        }
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        setError(err instanceof Error ? err.message : 'Failed to load filter options');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOptions();
  }, []);

  return { options, isLoading, error };
}

/**
 * Format a raw option value for display
 * Handles snake_case and lowercase values
 */
export function formatOptionLabel(value: string): string {
  if (!value) return '';

  // Handle snake_case tags
  const withSpaces = value.replace(/_/g, ' ');

  // Handle hyphenated words like "african-american"
  const parts = withSpaces.split(/[\s-]+/);

  // Title case each word
  return parts
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
