
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPersonas } from "@/services/persona"; // Updated import path
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import PersonaCard from "./PersonaCard";
import { Persona } from "@/services/persona/types";

interface PersonaListProps {
  onPersonasLoad?: (personas: Persona[]) => void;
  filterByCurrentUser?: boolean;
  publicOnly?: boolean;
  collectionId?: string;
  onDeleteCollection?: () => void;
}

export default function PersonaList({ 
  onPersonasLoad, 
  filterByCurrentUser = false, 
  publicOnly = false,
  collectionId,
  onDeleteCollection
}: PersonaListProps) {
  const { user } = useAuth();
  
  // Use React Query to fetch personas
  const { data: allPersonas = [], isLoading, error } = useQuery({
    queryKey: ['personas', { filterByCurrentUser, publicOnly, collectionId, userId: user?.id }],
    queryFn: async () => {
      try {
        let data = await getAllPersonas();
        
        console.log("Total personas loaded:", data.length);
        
        // Apply the correct filtering logic:
        // 1. If we're in the library (publicOnly=true), show only public personas from other users and all personas from the current user
        // 2. If we're filtering by current user, only show the current user's personas
        // 3. If neither, follow the original logic
        
        if (publicOnly) {
          // For the public library, show:
          // - Public personas from other users
          // - All personas (public and private) from the current user
          if (user) {
            data = data.filter(persona => 
              persona.is_public || // Public personas from anyone
              persona.user_id === user.id // All personas (public and private) from current user
            );
          } else {
            // If no user is logged in, only show public personas
            data = data.filter(persona => persona.is_public);
          }
        } else if (filterByCurrentUser && user) {
          // If filtering by current user, only show current user's personas
          data = data.filter(persona => persona.user_id === user.id);
        }
        
        console.log(`Loaded ${data.length} personas with filters:`, 
          { filterByCurrentUser, publicOnly, collectionId });
        
        return data;
      } catch (err) {
        console.error("Error loading personas:", err);
        toast.error("Failed to load personas");
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    
    // If we're filtering by public only and a persona was made private, remove it from the list
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

// Import the getPersonasByCollection function at the top of the file
import { getPersonasByCollection } from "@/services/persona"; // Updated import path
