import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getPublicV4PersonasShowAll } from "@/services/persona";
import { useUnifiedPersonaSearch } from "@/hooks/useUnifiedPersonaSearch";

interface PublicPersonasListProps {
  onPersonasLoad?: (personas: V4Persona[]) => void;
  searchQuery?: string;
  selectedTags?: string[];
  selectedAge?: string;
  selectedRegion?: string;
  selectedIncome?: string;
  selectedSourceType?: string;
  className?: string;
}

const PublicPersonasList = ({
  onPersonasLoad,
  searchQuery = "",
  selectedTags = [],
  selectedAge = "",
  selectedRegion = "",
  selectedIncome = "",
  selectedSourceType = "",
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6"
}: PublicPersonasListProps) => {
  const [personas, setPersonas] = useState<V4Persona[]>([]);

  // Show ALL public personas without any filtering
  const { data: allPersonas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['public-personas-show-all'],
    queryFn: getPublicV4PersonasShowAll,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  // Update the parent component with loaded personas
  useEffect(() => {
    if (allPersonas && onPersonasLoad) {
      onPersonasLoad(allPersonas);
    }
  }, [allPersonas, onPersonasLoad]);

  // Apply advanced filters
  const applyAdvancedFilters = (personas: V4Persona[]) => {
    return personas.filter(persona => {
      // Tags filter - V4 personas don't have preinterview_tags
      // This filtering can be implemented when tags are added to V4 schema
      if (selectedTags.length > 0) {
        // Skip tag filtering for now since V4 personas don't have this field
        // TODO: Implement when tags are added to V4 personas
      }

      // Age filter
      if (selectedAge) {
        const age = persona.conversation_summary?.demographics?.age;
        if (!age) return false;
        
        const ageNum = typeof age === 'string' ? parseInt(age) : age;
        if (isNaN(ageNum)) return false;

        switch (selectedAge) {
          case "18-25":
            if (ageNum < 18 || ageNum > 25) return false;
            break;
          case "26-35":
            if (ageNum < 26 || ageNum > 35) return false;
            break;
          case "36-50":
            if (ageNum < 36 || ageNum > 50) return false;
            break;
          case "51+":
            if (ageNum < 51) return false;
            break;
        }
      }

      // Region filter
      if (selectedRegion) {
        const location = persona.conversation_summary?.demographics?.location;
        if (!location || !location.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }

      // Source type filter (if you have this data)
      if (selectedSourceType) {
        // Add source type filtering logic if available
      }

      return true;
    });
  };

  // Apply filters and search
  const filteredPersonas = applyAdvancedFilters(allPersonas);
  const searchedPersonas = useUnifiedPersonaSearch(filteredPersonas, searchQuery, { 
    context: 'library',
    maxResults: 50 
  });

  // Update local state
  useEffect(() => {
    setPersonas(searchedPersonas);
  }, [searchedPersonas]);

  if (error) {
    console.error("Error loading public personas:", error);
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading personas: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <PersonaLoadingState />;
  }

  if (personas.length === 0) {
    const hasFilters = searchQuery || selectedTags.length > 0 || selectedAge || selectedRegion || selectedSourceType;
    
    if (hasFilters) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No public personas match your current filters.</p>
        </div>
      );
    }
    
    return <PersonaEmptyState />;
  }

  return (
    <div className={className}>
        {personas.map((persona) => (
          <PersonaCard
            key={persona.persona_id}
            persona={persona}
            forcePublic={true}
          />
        ))}
    </div>
  );
};

export default PublicPersonasList;