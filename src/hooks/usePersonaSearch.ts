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
    
    return personas.filter(persona => {
      // Search in name
      if (persona.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in prompt/description (for PersonaList compatibility)
      if (persona.prompt?.toLowerCase().includes(searchLower)) return true;
      
      // Search in metadata demographics
      const metadata = persona.metadata;
      if (metadata) {
        // Search across demographic fields
        const searchFields = [
          metadata.age,
          metadata.gender,
          metadata.occupation,
          metadata.region,
          metadata.location_history?.current_residence,
          metadata.education_level,
          metadata.income_level,
          metadata.race_ethnicity
        ];
        
        if (searchFields.some(field => 
          field && field.toLowerCase().includes(searchLower)
        )) return true;
        
        // Fallback: search entire metadata as JSON string (for PersonaList compatibility)
        const metadataString = JSON.stringify(metadata).toLowerCase();
        if (metadataString.includes(searchLower)) return true;
      }
      
      // Search in trait profile (for PersonaList compatibility)
      if (persona.trait_profile) {
        const traitString = JSON.stringify(persona.trait_profile).toLowerCase();
        if (traitString.includes(searchLower)) return true;
      }
      
      // Search in tags
      if (persona.preinterview_tags && Array.isArray(persona.preinterview_tags)) {
        return persona.preinterview_tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });
  }, [personas, searchTerm]);
};