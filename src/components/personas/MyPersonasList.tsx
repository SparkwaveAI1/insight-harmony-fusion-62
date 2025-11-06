import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getMyV4PersonasShowAll } from "@/services/persona";
import { useUnifiedPersonaSearch } from "@/hooks/useUnifiedPersonaSearch";
import { useAuth } from "@/context/AuthContext";
import { updatePersonaVisibility } from "@/services/persona/operations/updatePersona";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MyPersonasListProps {
  onPersonasLoad?: (personas: V4Persona[]) => void;
  searchQuery?: string;
  selectedTags?: string[];
  selectedAge?: string;
  selectedRegion?: string;
  selectedIncome?: string;
  selectedSourceType?: string;
  className?: string;
}

const MyPersonasList = ({
  onPersonasLoad,
  searchQuery = "",
  selectedTags = [],
  selectedAge = "",
  selectedRegion = "",
  selectedIncome = "",
  selectedSourceType = "",
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6"
}: MyPersonasListProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const [personas, setPersonas] = useState<V4Persona[]>([]);
  const queryClient = useQueryClient();
  
  // Show ALL user's personas without any filtering
  const { data: allPersonas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-personas-show-all', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for my personas");
        return [];
      }
      
      console.log("=== FETCHING MY PERSONAS ===");
      console.log("User ID:", user.id);
      console.log("User object:", user);
      
      const data = await getMyV4PersonasShowAll(user.id);
      console.log("My personas fetched:", data?.length || 0);
      console.log("Sample persona:", data?.[0]);
      
      return data;
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Update the parent component with loaded personas
  useEffect(() => {
    if (allPersonas && onPersonasLoad) {
      onPersonasLoad(allPersonas);
    }
  }, [allPersonas]); // Remove onPersonasLoad from dependencies to prevent infinite loop

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

  // Update local state only when paginatedPersonas actually changes
  useEffect(() => {
    setPersonas(paginatedPersonas);
  }, [paginatedPersonas]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, selectedAge, selectedRegion, selectedIncome, selectedSourceType]);

  // Handle visibility changes
  const handleVisibilityChange = async (personaId: string, isPublic: boolean) => {
    try {
      await updatePersonaVisibility(personaId, isPublic);
      
      // Update local state immediately
      setPersonas(prevPersonas => 
        prevPersonas.map(persona => 
          persona.persona_id === personaId 
            ? { ...persona, is_public: isPublic }
            : persona
        )
      );
      
      // Invalidate caches so other views update
      queryClient.invalidateQueries({ queryKey: ['my-personas-show-all', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['public-personas-show-all'] });
      
      // Refetch to ensure consistency in this list
      refetch();
    } catch (error) {
      console.error("Error updating persona visibility:", error);
    }
  };

  // Handle deletion
  const handleDelete = (personaId: string) => {
    // Remove from local state immediately
    setPersonas(prevPersonas => 
      prevPersonas.filter(persona => persona.persona_id !== personaId)
    );
    
    // Refetch to ensure consistency
    refetch();
  };

  if (authLoading) {
    return <PersonaLoadingState />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your personas.</p>
      </div>
    );
  }

  if (error) {
    console.error("Error loading my personas:", error);
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
          <p className="text-muted-foreground">No personas match your current filters.</p>
        </div>
      );
    }
    
    return <PersonaEmptyState />;
  }

  return (
    <div>
      <div className={className}>
        {personas.map((persona) => (
          <PersonaCard 
            key={persona.persona_id} 
            persona={persona}
            onVisibilityChange={handleVisibilityChange}
            onDelete={handleDelete}
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

export default MyPersonasList;