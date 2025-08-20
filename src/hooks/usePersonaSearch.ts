import { useMemo } from 'react';
import { Persona } from '@/services/persona/types';

/**
 * Enhanced persona search functionality that searches across multiple fields
 * including name, demographics, traits, and tags
 */
export const usePersonaSearch = (personas: Persona[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return personas;

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Separate matches by priority for better relevance
    const nameMatches: Persona[] = [];
    const descriptionMatches: Persona[] = [];
    const metadataMatches: Persona[] = [];
    
    personas.forEach(persona => {
      let matched = false;
      
      // Priority 1: Search in name
      if (persona.name?.toLowerCase().includes(searchLower)) {
        nameMatches.push(persona);
        matched = true;
        return;
      }
      
      // Priority 2: Search in description
      if (persona.description?.toLowerCase().includes(searchLower)) {
        descriptionMatches.push(persona);
        matched = true;
        return;
      }
      
      // Priority 3: Search in metadata
      const metadata = persona.metadata;
      if (metadata && !matched) {
        // Search in metadata description
        if (metadata.description?.toLowerCase().includes(searchLower)) {
          metadataMatches.push(persona);
          return;
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
          metadataMatches.push(persona);
          return;
        }
        
        // Search in knowledge domains
        if (metadata.knowledge_domains && typeof metadata.knowledge_domains === 'object') {
          const domainKeys = Object.keys(metadata.knowledge_domains);
          if (domainKeys.some(key => key.toLowerCase().includes(searchLower))) {
            metadataMatches.push(persona);
            return;
          }
        }
      }
      
      // Search in tags
      if (persona.preinterview_tags && Array.isArray(persona.preinterview_tags)) {
        if (persona.preinterview_tags.some(tag => 
          tag && typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
        )) {
          metadataMatches.push(persona);
        }
      }
    });
    
    // Return results prioritized by relevance
    return [...nameMatches, ...descriptionMatches, ...metadataMatches];
  }, [personas, searchTerm]);
};