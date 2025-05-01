
import { useState, useEffect } from "react";
import { getAllPersonas } from "@/services/persona/personaService";
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
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPersonas();
  }, [filterByCurrentUser, publicOnly, collectionId, user]);

  const loadPersonas = async () => {
    setIsLoading(true);
    try {
      let data = await getAllPersonas();
      
      console.log("Total personas loaded:", data.length);
      
      // Apply filters based on the props
      if (filterByCurrentUser && user) {
        console.log("Filtering by current user:", user.id);
        data = data.filter(persona => persona.user_id === user.id);
        console.log("After user filter:", data.length, "personas");
      }
      
      if (publicOnly) {
        // When publicOnly is true, we need to ensure:
        // 1. Either show public personas from other users
        // 2. OR show all personas (public AND private) owned by the current user
        if (user) {
          // For logged-in users, show public personas from others + all of their own personas
          data = data.filter(persona => 
            persona.is_public || // Public personas from anyone
            (persona.user_id === user.id) // Or any persona owned by current user
          );
        } else {
          // For non-logged in users, show only public personas
          data = data.filter(persona => persona.is_public);
        }
        console.log("After public filter:", data.length, "personas");
      }
      
      if (collectionId) {
        // This would require an API call to get personas in a specific collection
        const collectionPersonas = await getPersonasByCollection(collectionId);
        data = collectionPersonas;
      }
      
      console.log(`Loaded ${data.length} personas with filters:`, 
        { filterByCurrentUser, publicOnly, collectionId });
      
      setPersonas(data);
      onPersonasLoad?.(data);
    } catch (error) {
      console.error("Error loading personas:", error);
      toast.error("Failed to load personas");
    } finally {
      setIsLoading(false);
    }
  };

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
    // But only if it's not owned by the current user
    if (publicOnly && !isPublic && user && persona?.user_id !== user.id) {
      setPersonas(prevPersonas => 
        prevPersonas.filter(persona => persona.persona_id !== personaId)
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
import { getPersonasByCollection } from "@/services/persona/personaService";

