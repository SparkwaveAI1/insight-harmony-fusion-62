import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getPublicV4PersonasShowAll } from "@/services/persona";
import { useSemanticPersonaSearch, SemanticSearchResult } from "@/hooks/useSemanticPersonaSearch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PublicPersonasListProps {
  onPersonasLoad?: (personas: V4Persona[]) => void;
  searchQuery?: string;
  selectedAge?: string;
  onSearchingChange?: (isSearching: boolean) => void;
  className?: string;
}

const PublicPersonasList = ({
  onPersonasLoad,
  searchQuery = "",
  selectedAge = "",
  onSearchingChange,
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6"
}: PublicPersonasListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch all public personas (used when no search query)
  const { data: allPersonas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['public-personas-show-all'],
    queryFn: getPublicV4PersonasShowAll,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Semantic search (used when search query is 2+ characters)
  const { 
    results: semanticResults, 
    isLoading: isSearching 
  } = useSemanticPersonaSearch(searchQuery, { 
    enabled: searchQuery.length >= 2,
    maxResults: 100 
  });

  // Notify parent of search state
  useEffect(() => {
    onSearchingChange?.(isSearching);
  }, [isSearching, onSearchingChange]);

  // Update the parent component with loaded personas
  useEffect(() => {
    if (allPersonas && onPersonasLoad) {
      onPersonasLoad(allPersonas);
    }
  }, [allPersonas, onPersonasLoad]);

  // Apply age filter
  const applyAgeFilter = (personas: (V4Persona | SemanticSearchResult)[]) => {
    if (!selectedAge) return personas;
    
    return personas.filter(persona => {
      // Use age_computed if available, otherwise fallback to conversation_summary
      const age = 'age_computed' in persona && persona.age_computed 
        ? persona.age_computed 
        : persona.conversation_summary?.demographics?.age;
      
      if (!age) return false;
      
      const ageNum = typeof age === 'string' ? parseInt(age) : age;
      if (isNaN(ageNum)) return false;

      switch (selectedAge) {
        case "18-25":
          return ageNum >= 18 && ageNum <= 25;
        case "26-35":
          return ageNum >= 26 && ageNum <= 35;
        case "36-50":
          return ageNum >= 36 && ageNum <= 50;
        case "51-65":
          return ageNum >= 51 && ageNum <= 65;
        case "65+":
          return ageNum >= 65;
        default:
          return true;
      }
    });
  };

  // Determine which personas to show
  const useSemanticSearch = searchQuery.length >= 2;
  const basePersonas = useSemanticSearch ? semanticResults : allPersonas;
  const filteredPersonas = applyAgeFilter(basePersonas);

  // Pagination
  const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPersonas = filteredPersonas.slice(startIndex, endIndex);

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAge, itemsPerPage]);

  if (error) {
    console.error("Error loading public personas:", error);
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading personas: {error.message}</p>
      </div>
    );
  }

  if (isLoading || (useSemanticSearch && isSearching)) {
    return <PersonaLoadingState />;
  }

  if (paginatedPersonas.length === 0) {
    const hasFilters = searchQuery || selectedAge;
    
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
    if (!isPublic) {
      refetch();
    }
  };

  return (
    <div>
      <div className={className}>
        {paginatedPersonas.map((persona) => (
          <PersonaCard
            key={persona.persona_id}
            persona={persona as V4Persona}
            onVisibilityChange={handleVisibilityChange}
          />
        ))}
      </div>
      
      <div className="flex justify-center items-center gap-4 mt-8 pb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={String(itemsPerPage)} onValueChange={(val) => setItemsPerPage(Number(val))}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {totalPages > 1 && (
          <>
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
              Page {currentPage} of {totalPages} ({filteredPersonas.length} personas)
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
          </>
        )}

        {totalPages <= 1 && (
          <span className="text-sm text-muted-foreground">
            {filteredPersonas.length} personas
          </span>
        )}
      </div>
    </div>
  );
};

export default PublicPersonasList;
