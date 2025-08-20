import { useMemo } from 'react';
import { DbPersona } from '@/services/persona/operations/personaOperations';

/**
 * Enhanced persona search functionality that searches across multiple fields
 * including name, demographics, traits, and tags
 */
export const usePersonaSearch = (personas: DbPersona[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return personas;

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Separate matches by priority for better relevance
    const nameMatches: DbPersona[] = [];
    const descriptionMatches: DbPersona[] = [];
    const metadataMatches: DbPersona[] = [];
    
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
      
      // Priority 3: Search in persona_data
      const personaData = persona.persona_data;
      if (personaData && !matched) {
        // Search in identity fields
        const identity = personaData.identity;
        if (identity) {
          const searchFields = [
            identity.age?.toString(),
            identity.gender,
            identity.occupation,
            identity.location?.city,
            identity.location?.country,
            identity.ethnicity,
            identity.nationality,
            identity.relationship_status
          ];
          
          if (searchFields.some(field => 
            field && typeof field === 'string' && field.toLowerCase().includes(searchLower)
          )) {
            metadataMatches.push(persona);
            return;
          }
        }
        
        // Search in socioeconomic context
        if (identity?.socioeconomic_context) {
          const socioEcon = identity.socioeconomic_context;
          const searchFields = [
            socioEcon.income_level,
            socioEcon.education_level,
            socioEcon.social_class_identity,
            socioEcon.political_affiliation,
            socioEcon.religious_affiliation,
            socioEcon.cultural_background
          ];
          
          if (searchFields.some(field => 
            field && typeof field === 'string' && field.toLowerCase().includes(searchLower)
          )) {
            metadataMatches.push(persona);
            return;
          }
        }
        
        // Search in cognitive traits
        if (personaData.cognitive_profile?.big_five) {
          const traitsText = JSON.stringify(personaData.cognitive_profile.big_five).toLowerCase();
          if (traitsText.includes(searchLower)) {
            metadataMatches.push(persona);
            return;
          }
        }
      }
      
      // Search in emotional triggers and supports
      if (personaData?.emotional_triggers?.positive || personaData?.emotional_triggers?.negative) {
        const triggers = [
          ...(personaData.emotional_triggers.positive || []),
          ...(personaData.emotional_triggers.negative || [])
        ];
        if (triggers.some(trigger => 
          trigger && typeof trigger === 'string' && trigger.toLowerCase().includes(searchLower)
        )) {
          metadataMatches.push(persona);
        }
      }
      
      // Search in life context supports
      if (personaData?.life_context?.supports) {
        if (personaData.life_context.supports.some(support => 
          support && typeof support === 'string' && support.toLowerCase().includes(searchLower)
        )) {
          metadataMatches.push(persona);
        }
      }
    });
    
    // Return results prioritized by relevance
    return [...nameMatches, ...descriptionMatches, ...metadataMatches];
  }, [personas, searchTerm]);
};