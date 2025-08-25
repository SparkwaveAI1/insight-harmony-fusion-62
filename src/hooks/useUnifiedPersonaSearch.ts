import { useMemo } from 'react';
import { V4Persona } from '@/types/persona-v4';

interface SearchResult {
  persona: V4Persona;
  score: number;
  matchType: 'name' | 'occupation' | 'location' | 'background' | 'expertise' | 'other';
  matchedText: string;
}

interface SearchOptions {
  context?: 'library' | 'collection' | 'research';
  maxResults?: number;
  minScore?: number;
}

/**
 * Unified persona search with multiple fallback strategies
 * Replaces the broken usePersonaSearch with a robust implementation
 */
export const useUnifiedPersonaSearch = (
  personas: V4Persona[],
  searchTerm: string,
  options: SearchOptions = {}
) => {
  return useMemo(() => {
    if (!searchTerm?.trim()) return personas;

    const { context = 'library', maxResults = 100, minScore = 0.1 } = options;
    const searchLower = searchTerm.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Define context-specific scoring weights
    const weights = {
      library: { name: 10, occupation: 8, location: 6, background: 4, expertise: 5, other: 2 },
      collection: { name: 8, occupation: 7, location: 5, background: 6, expertise: 8, other: 3 },
      research: { name: 6, occupation: 9, location: 4, background: 8, expertise: 10, other: 4 }
    };

    personas.forEach(persona => {
      // Try multiple search strategies with fallbacks
      const searchMethods = [
        () => searchConversationSummary(persona, searchLower, weights[context]),
        () => searchFullProfile(persona, searchLower, weights[context]),
        () => searchRootFields(persona, searchLower, weights[context])
      ];

      for (const searchMethod of searchMethods) {
        const result = searchMethod();
        if (result) {
          results.push(result);
          break; // Use first successful search method
        }
      }
    });

    // Sort by score (descending) and apply limits
    return results
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(r => r.persona);
  }, [personas, searchTerm, options.context, options.maxResults, options.minScore]);
};

// Strategy 1: Search conversation_summary (preferred)
function searchConversationSummary(persona: V4Persona, searchLower: string, weights: any): SearchResult | null {
  const summary = persona.conversation_summary;
  if (!summary) return null;

  // Name match (highest priority)
  if (summary.demographics?.name?.toLowerCase().includes(searchLower)) {
    return {
      persona,
      score: weights.name,
      matchType: 'name',
      matchedText: summary.demographics.name
    };
  }

  // Occupation match
  if (summary.demographics?.occupation?.toLowerCase().includes(searchLower)) {
    return {
      persona,
      score: weights.occupation,
      matchType: 'occupation',
      matchedText: summary.demographics.occupation
    };
  }

  // Location match
  if (summary.demographics?.location?.toLowerCase().includes(searchLower)) {
    return {
      persona,
      score: weights.location,
      matchType: 'location',
      matchedText: summary.demographics.location
    };
  }

  // Background description match
  if (summary.demographics?.background_description?.toLowerCase().includes(searchLower)) {
    return {
      persona,
      score: weights.background,
      matchType: 'background',
      matchedText: summary.demographics.background_description.substring(0, 100)
    };
  }

  // Expertise domains match
  if (summary.knowledge_profile?.expertise_domains) {
    const matchedDomain = summary.knowledge_profile.expertise_domains.find(domain =>
      typeof domain === 'string' && domain.toLowerCase().includes(searchLower)
    );
    if (matchedDomain) {
      return {
        persona,
        score: weights.expertise,
        matchType: 'expertise',
        matchedText: matchedDomain
      };
    }
  }

  // Other summary fields
  const otherFields = [
    summary.motivation_summary,
    summary.goal_priorities,
    summary.want_vs_should_pattern,
    summary.inhibitor_summary,
    summary.truth_flexibility_summary,
    summary.voice_summary,
    summary.communication_style?.directness,
    summary.communication_style?.formality,
    summary.communication_style?.signature_phrases?.join(' '),
    summary.emotional_triggers_summary,
    summary.contradictions_summary,
    summary.sexuality_summary
  ];

  const matchedField = otherFields.find(field =>
    field && typeof field === 'string' && field.toLowerCase().includes(searchLower)
  );

  if (matchedField) {
    return {
      persona,
      score: weights.other,
      matchType: 'other',
      matchedText: typeof matchedField === 'string' ? matchedField.substring(0, 100) : ''
    };
  }

  return null;
}

// Strategy 2: Search full_profile (fallback)
function searchFullProfile(persona: V4Persona, searchLower: string, weights: any): SearchResult | null {
  const profile = persona.full_profile;
  if (!profile) return null;

  // Search identity fields
  const identity = profile.identity;
  if (identity?.name?.toLowerCase().includes(searchLower)) {
    return { persona, score: weights.name * 0.8, matchType: 'name', matchedText: identity.name };
  }
  if (identity?.occupation?.toLowerCase().includes(searchLower)) {
    return { persona, score: weights.occupation * 0.8, matchType: 'occupation', matchedText: identity.occupation };
  }
  if (identity?.location?.city?.toLowerCase().includes(searchLower)) {
    return { persona, score: weights.location * 0.8, matchType: 'location', matchedText: identity.location.city };
  }

  // Search expertise
  if (profile.knowledge_profile?.expertise_domains) {
    const matchedDomain = profile.knowledge_profile.expertise_domains.find(domain =>
      domain.toLowerCase().includes(searchLower)
    );
    if (matchedDomain) {
      return { persona, score: weights.expertise * 0.8, matchType: 'expertise', matchedText: matchedDomain };
    }
  }

  return null;
}

// Strategy 3: Search root fields (last resort)
function searchRootFields(persona: V4Persona, searchLower: string, weights: any): SearchResult | null {
  // Search persona name
  if (persona.name?.toLowerCase().includes(searchLower)) {
    return { persona, score: weights.name * 0.5, matchType: 'name', matchedText: persona.name };
  }

  return null;
}
