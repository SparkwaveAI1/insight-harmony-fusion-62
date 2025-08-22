import { useMemo } from 'react';
import { Persona } from '@/services/persona/types';
import { V4Persona } from '@/types/persona-v4';

/**
 * Helper function to check if a persona is V4
 */
const isV4Persona = (persona: any): persona is V4Persona => {
  return persona.conversation_summary && persona.full_profile;
};

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
 * Search function for legacy personas using existing logic
 */
const searchLegacyPersona = (persona: Persona, searchLower: string): number => {
  // Priority 1: Search in name
  if (persona.name?.toLowerCase().includes(searchLower)) {
    return 1;
  }
  
  // Priority 2: Search in description
  if (persona.description?.toLowerCase().includes(searchLower)) {
    return 2;
  }
  
  // Priority 3: Search in metadata
  const metadata = persona.metadata;
  if (metadata) {
    // Search in metadata description
    if (metadata.description?.toLowerCase().includes(searchLower)) {
      return 3;
    }
    
    // Search across demographic fields
    const searchFields = [
      metadata.age,
      metadata.gender,
      metadata.occupation,
      metadata.region,
      metadata.location_history?.current_residence,
      metadata.location_history?.grew_up_in,
      metadata.education_level,
      metadata.income_level,
      metadata.race_ethnicity,
      metadata.physical_health_status,
      metadata.mental_health_status,
      metadata.religious_affiliation,
      metadata.cultural_background
    ];
    
    if (searchFields.some(field => 
      field && typeof field === 'string' && field.toLowerCase().includes(searchLower)
    )) {
      return 3;
    }
    
    // Search in knowledge domains
    if (metadata.knowledge_domains && typeof metadata.knowledge_domains === 'object') {
      const domainKeys = Object.keys(metadata.knowledge_domains);
      if (domainKeys.some(key => key.toLowerCase().includes(searchLower))) {
        return 3;
      }
    }
  }
  
  // Search in tags
  if (persona.preinterview_tags && Array.isArray(persona.preinterview_tags)) {
    if (persona.preinterview_tags.some(tag => 
      tag && typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
    )) {
      return 3;
    }
  }

  return 0; // No match
};

/**
 * Enhanced persona search functionality that works with both V4 and legacy personas
 * Searches across multiple fields with proper priority ordering
 */
export const usePersonaSearch = (personas: Persona[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return personas;

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Create matches with priority scores
    const matches: { persona: Persona; priority: number }[] = [];
    
    personas.forEach(persona => {
      let priority = 0;
      
      if (isV4Persona(persona)) {
        priority = searchV4Persona(persona, searchLower);
      } else {
        priority = searchLegacyPersona(persona, searchLower);
      }
      
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