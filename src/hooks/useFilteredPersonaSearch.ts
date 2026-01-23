// src/hooks/useFilteredPersonaSearch.ts

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PersonaFilters, DEFAULT_FILTERS } from '@/types/personaFilters';

// Map ethnicity display categories to search terms for database matching
const ETHNICITY_SEARCH_TERMS: Record<string, string[]> = {
  'White (e.g., European descent)': ['white', 'european', 'caucasian', 'irish', 'german', 'italian', 'polish', 'english', 'scottish', 'french', 'russian', 'jewish'],
  'Black or African descent': ['black', 'african', 'african american', 'african-american', 'nigerian', 'ethiopian', 'jamaican', 'haitian'],
  'East Asian (e.g., Chinese, Korean, Japanese)': ['east asian', 'chinese', 'korean', 'japanese', 'taiwanese'],
  'South Asian (e.g., Indian, Pakistani, Sri Lankan)': ['south asian', 'indian', 'pakistani', 'sri lankan', 'bangladeshi', 'nepali'],
  'Southeast Asian (e.g., Filipino, Vietnamese, Thai)': ['southeast asian', 'filipino', 'filipina', 'vietnamese', 'thai', 'indonesian', 'malaysian', 'cambodian', 'burmese', 'laotian'],
  'Middle Eastern or North African (MENA)': ['middle eastern', 'arab', 'arabic', 'persian', 'iranian', 'turkish', 'lebanese', 'egyptian', 'moroccan', 'north african', 'mena'],
  'Native American or Alaska Native': ['native american', 'indigenous', 'alaska native', 'american indian', 'first nations', 'cherokee', 'navajo', 'sioux', 'apache', 'choctaw'],
  'Native Hawaiian or Pacific Islander': ['hawaiian', 'pacific islander', 'samoan', 'tongan', 'fijian', 'polynesian', 'micronesian', 'melanesian', 'maori'],
  'Mixed / Multiracial': ['mixed', 'multiracial', 'biracial', 'multi-ethnic', 'mixed race'],
  'Another race or ancestry': ['other'],
};

// Expand selected ethnicity categories to search terms
function expandEthnicityFilters(selectedCategories: string[]): string[] {
  const searchTerms: string[] = [];
  for (const category of selectedCategories) {
    const terms = ETHNICITY_SEARCH_TERMS[category];
    if (terms) {
      searchTerms.push(...terms);
    } else {
      // If not a known category, use as-is
      searchTerms.push(category);
    }
  }
  return searchTerms;
}

export interface FilteredSearchResult {
  persona_id: string;
  name: string;
  age: number;
  gender: string;
  ethnicity: string;
  state_region: string;
  city: string;
  occupation: string;
  income_bracket: string;
  education_level: string;
  has_children: boolean;
  dependents: number;
  political_lean: string;
  profile_image_url: string;
  profile_thumbnail_url: string;
  interest_tags: string[];
  health_tags: string[];
  created_at: string;
  background: string;
  is_public: boolean;
  semantic_score: number | null;
  total_count: number;
}

interface UseFilteredPersonaSearchOptions {
  publicOnly?: boolean;
  userId?: string;
  collectionIds?: string[];
  limit?: number;
}

interface UseFilteredPersonaSearchReturn {
  results: FilteredSearchResult[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filters: PersonaFilters;
  setFilters: (filters: PersonaFilters) => void;
  updateFilter: <K extends keyof PersonaFilters>(key: K, value: PersonaFilters[K]) => void;
  resetFilters: () => void;
  search: () => Promise<void>;
  hasActiveFilters: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export function useFilteredPersonaSearch(
  initialFilters: PersonaFilters = DEFAULT_FILTERS,
  options: UseFilteredPersonaSearchOptions = {}
): UseFilteredPersonaSearchReturn {
  const { publicOnly = true, userId, collectionIds, limit = 50 } = options;

  const [filters, setFilters] = useState<PersonaFilters>(initialFilters);
  const [results, setResults] = useState<FilteredSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  // Check if any filters are active
  const hasActiveFilters =
    filters.ageMin !== null ||
    filters.ageMax !== null ||
    filters.genders.length > 0 ||
    filters.ethnicities.length > 0 ||
    filters.states.length > 0 ||
    filters.hasChildren !== null ||
    filters.maritalStatuses.length > 0 ||
    filters.occupationContains !== '' ||
    filters.incomeBrackets.length > 0 ||
    filters.educationLevels.length > 0 ||
    filters.interestTagsAny.length > 0 ||
    filters.healthTagsAny.length > 0 ||
    filters.workRoleTagsAny.length > 0 ||
    filters.politicalLeans.length > 0 ||
    filters.textContains !== '' ||
    filters.textExcludes !== '' ||
    filters.nameContains !== '';

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build params object, only including non-empty values
      const params: Record<string, unknown> = {
        p_public_only: publicOnly,
        p_limit: limit,
        p_offset: (currentPage - 1) * limit,
        p_sort_by: 'created', // Sort by created_at DESC (most recent first)
      };

      // User ID for private personas
      if (userId) params.p_user_id = userId;

      // Demographics
      if (filters.ageMin !== null) params.p_age_min = filters.ageMin;
      if (filters.ageMax !== null) params.p_age_max = filters.ageMax;
      if (filters.genders.length > 0) params.p_genders = filters.genders;
      if (filters.ethnicities.length > 0) {
        // Expand ethnicity categories to search terms
        params.p_ethnicities = expandEthnicityFilters(filters.ethnicities);
      }
      if (filters.states.length > 0) params.p_states = filters.states;

      // Household
      if (filters.hasChildren !== null) params.p_has_children = filters.hasChildren;
      if (filters.maritalStatuses.length > 0) params.p_marital_statuses = filters.maritalStatuses;

      // Occupation/Education
      if (filters.occupationContains) params.p_occupation_contains = filters.occupationContains;
      if (filters.incomeBrackets.length > 0) params.p_income_brackets = filters.incomeBrackets;
      if (filters.educationLevels.length > 0) params.p_education_levels = filters.educationLevels;

      // Tags
      if (filters.interestTagsAny.length > 0) params.p_interest_tags_any = filters.interestTagsAny;
      if (filters.healthTagsAny.length > 0) params.p_health_tags_any = filters.healthTagsAny;
      if (filters.workRoleTagsAny.length > 0) params.p_work_role_tags_any = filters.workRoleTagsAny;

      // Political
      if (filters.politicalLeans.length > 0) params.p_political_leans = filters.politicalLeans;

      // Text search
      if (filters.textContains) params.p_text_contains = filters.textContains;
      if (filters.textExcludes) params.p_text_excludes = filters.textExcludes;

      // Name search
      if (filters.nameContains) params.p_name_contains = filters.nameContains;

      // Collection scope
      if (collectionIds && collectionIds.length > 0) {
        params.p_collection_ids = collectionIds;
      }

      const { data, error: rpcError } = await supabase.rpc(
        'search_personas_unified',
        params
      );

      if (rpcError) throw rpcError;

      setResults(data || []);
      setTotalCount(data?.[0]?.total_count || 0);
    } catch (err) {
      console.error('Filtered search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, publicOnly, userId, collectionIds, limit, currentPage]);

  const updateFilter = useCallback(<K extends keyof PersonaFilters>(
    key: K,
    value: PersonaFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    setResults([]);
    setTotalCount(0);
  }, []);

  return {
    results,
    totalCount,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    search,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}
