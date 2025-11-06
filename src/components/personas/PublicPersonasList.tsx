import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getPublicV4PersonasShowAll } from "@/services/persona";
import { useUnifiedPersonaSearch } from "@/hooks/useUnifiedPersonaSearch";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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

  // Pagination
  const totalPages = Math.ceil(searchedPersonas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPersonas = searchedPersonas.slice(startIndex, endIndex);

  // Update local state
  useEffect(() => {
    setPersonas(paginatedPersonas);
  }, [paginatedPersonas]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, selectedAge, selectedRegion, selectedIncome, selectedSourceType]);

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

  const handleVisibilityChange = (personaId: string, isPublic: boolean) => {
    // If persona is made private, remove it from the list and refetch
    if (!isPublic) {
      setPersonas(prev => prev.filter(p => p.persona_id !== personaId));
      refetch();
    }
  };

  return (
    <div>
      <div className={className}>
        {personas.map((persona) => (
          <PersonaCard
            key={persona.persona_id}
            persona={persona}
            onVisibilityChange={handleVisibilityChange}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({searchedPersonas.length} personas)
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublicPersonasList;