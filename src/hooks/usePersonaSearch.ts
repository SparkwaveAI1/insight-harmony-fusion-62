import { useMemo } from 'react';
import { V4Persona } from '@/types/persona-v4';

/**
 * Search function for V4 personas using their rich conversation_summary data
 */
const searchV4Persona = (persona: V4Persona, searchLower: string): number => {
  const summary = persona.conversation_summary;
  if (!summary) return 0;

  // Priority 1: Name match (highest priority)
  if (summary.demographics?.name?.toLowerCase().includes(searchLower)) {
    return 1;
  }

  // Priority 2: Occupation match
  if (summary.demographics?.occupation?.toLowerCase().includes(searchLower)) {
    return 2;
  }

  // Priority 3: Location match
  if (summary.demographics?.location?.toLowerCase().includes(searchLower)) {
    return 3;
  }

  // Priority 4: Background description match
  if (summary.demographics?.background_description?.toLowerCase().includes(searchLower)) {
    return 4;
  }

  // Priority 5: Expertise domains match
  if (summary.knowledge_profile?.expertise_domains) {
    const domains = Array.isArray(summary.knowledge_profile.expertise_domains) 
      ? summary.knowledge_profile.expertise_domains 
      : Object.keys(summary.knowledge_profile.expertise_domains);
    
    if (domains.some(domain => 
      typeof domain === 'string' && domain.toLowerCase().includes(searchLower)
    )) {
      return 5;
    }
  }

  // Priority 6: Other summary fields
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

  if (otherFields.some(field => 
    field && typeof field === 'string' && field.toLowerCase().includes(searchLower)
  )) {
    return 6;
  }

  return 0; // No match
};


/**
 * V4-only persona search functionality
 * Searches across V4 persona fields with proper priority ordering
 */
export const usePersonaSearch = (personas: V4Persona[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return personas;

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Create matches with priority scores
    const matches: { persona: V4Persona; priority: number }[] = [];
    
    personas.forEach(persona => {
      const priority = searchV4Persona(persona, searchLower);
      
      if (priority > 0) {
        matches.push({ persona, priority });
      }
    });
    
    // Sort by priority (lower number = higher priority) and return personas
    return matches
      .sort((a, b) => a.priority - b.priority)
      .map(match => match.persona);
  }, [personas, searchTerm]);
};