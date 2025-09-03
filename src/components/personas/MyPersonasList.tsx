import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getV4Personas } from "@/services/v4-persona/getV4Personas";
import { useUnifiedPersonaSearch } from "@/hooks/useUnifiedPersonaSearch";
import { useAuth } from "@/context/AuthContext";
import { updatePersonaVisibility } from "@/services/persona/operations/updatePersona";

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

  // Query for user's personas only
  const { data: allPersonas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-personas', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for my personas");
        return [];
      }
      
      console.log("Fetching my personas for user:", user.id);
      const data = await getV4Personas(user.id, { allowIncomplete: true });
      console.log("My personas count:", data?.length || 0);
      
      return data;
    },
    enabled: !!user?.id && !authLoading, // Only run when user is loaded
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true
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
      
      // Refetch to ensure consistency
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
  );
};

export default MyPersonasList;