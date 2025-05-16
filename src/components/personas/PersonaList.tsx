
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPersonas } from "@/services/persona"; 
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import PersonaCard from "./PersonaCard";
import { Persona } from "@/services/persona/types";
import { getPersonasByCollection } from "@/services/persona";
import { cn } from "@/lib/utils";

interface PersonaListProps {
  onPersonasLoad?: (personas: Persona[]) => void;
  filterByCurrentUser?: boolean;
  filterByOtherUsers?: boolean;
  publicOnly?: boolean;
  collectionId?: string;
  onDeleteCollection?: () => void;
  className?: string;
}

export default function PersonaList({ 
  onPersonasLoad, 
  filterByCurrentUser = false,
  filterByOtherUsers = false,
  publicOnly = false,
  collectionId,
  onDeleteCollection,
  className
}: PersonaListProps) {
  const { user } = useAuth();
  
  // Use React Query to fetch personas
  const { data: allPersonas = [], isLoading, error } = useQuery({
    queryKey: ['personas', { filterByCurrentUser, filterByOtherUsers, publicOnly, collectionId, userId: user?.id }],
    queryFn: async () => {
      try {
        console.log("Fetching personas with filters:", { filterByCurrentUser, filterByOtherUsers, publicOnly, collectionId });
        let data = await getAllPersonas();
        
        console.log("Total personas loaded:", data.length);
        
        // Apply filtering logic based on the view type
        if (collectionId) {
          // If we're in a collection, fetch personas for that collection
          const collectionPersonas = await getPersonasByCollection(collectionId);
          return collectionPersonas;
        } else if (filterByCurrentUser && user) {
          // For My Personas view: Show only the current user's personas
          console.log("Filtering by current user:", user.id);
          const userPersonas = data.filter(persona => persona.user_id === user.id);
          console.log("Current user's personas count:", userPersonas.length);
          return userPersonas;
        } else if (filterByOtherUsers && publicOnly && user) {
          // For Public Personas section: show only other users' public personas
          console.log("Filtering by other users' public personas");
          const filteredPersonas = data.filter(persona => 
            persona.is_public && persona.user_id !== user.id
          );
          console.log("Other users' public personas count:", filteredPersonas.length);
          return filteredPersonas;
        } else if (publicOnly) {
          // For the public library (Persona Library view):
          // Show only public personas (if not filtered by other users)
          console.log("Showing all public personas");
          const filteredPersonas = data.filter(persona => persona.is_public);
          console.log("All public personas count:", filteredPersonas.length);
          return filteredPersonas;
        }
        
        // Default: return all personas
        return data;
      } catch (err) {
        console.error("Error loading personas:", err);
        toast.error("Failed to load personas");
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Add this to ensure a refresh when component mounts
  });
  
  // Update the parent component with loaded personas
  useEffect(() => {
    if (allPersonas && onPersonasLoad) {
      onPersonasLoad(allPersonas);
    }
  }, [allPersonas, onPersonasLoad]);

  const [personas, setPersonas] = useState<Persona[]>([]);
  
  // Update local state when personas are loaded from React Query
  useEffect(() => {
    if (allPersonas) {
      console.log("Setting personas state with count:", allPersonas.length);
      setPersonas(allPersonas);
    }
  }, [allPersonas]);

  const handleVisibilityChange = (personaId: string, isPublic: boolean) => {
    // Update local state when visibility changes
    setPersonas(prevPersonas => 
      prevPersonas.map(persona => 
        persona.persona_id === personaId 
          ? { ...persona, is_public: isPublic } 
          : persona
      )
    );
    
    // If we're in the public library and a persona was made private,
    // remove it from the list only if it's not owned by the current user
    if (publicOnly && !isPublic) {
      setPersonas(prevPersonas => 
        prevPersonas.filter(persona => 
          persona.persona_id !== personaId || persona.user_id === user?.id
        )
      );
    }
  };

  const handleDelete = (personaId: string) => {
    // Remove the deleted persona from the list
    setPersonas(prevPersonas => 
      prevPersonas.filter(persona => persona.persona_id !== personaId)
    );
    
    // If we're in a collection and it's the last persona, trigger collection delete
    if (collectionId && personas.length <= 1 && onDeleteCollection) {
      onDeleteCollection();
    }
  };

  if (isLoading) {
    return <PersonaLoadingState />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading personas: {String(error)}</div>;
  }

  if (personas.length === 0) {
    return <PersonaEmptyState />;
  }

  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
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
}
