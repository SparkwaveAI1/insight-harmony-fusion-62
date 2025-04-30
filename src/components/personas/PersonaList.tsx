
import { useState, useEffect } from "react";
import { getAllPersonas } from "@/services/persona/personaService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import PersonaCard from "./PersonaCard";

interface PersonaListProps {
  onPersonasLoad?: (personas: any[]) => void;
  filterByCurrentUser?: boolean;
  publicOnly?: boolean;
  collectionId?: string;
}

export default function PersonaList({ 
  onPersonasLoad, 
  filterByCurrentUser = false, 
  publicOnly = false,
  collectionId
}: PersonaListProps) {
  const [personas, setPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPersonas();
  }, [filterByCurrentUser, publicOnly, collectionId, user]);

  const loadPersonas = async () => {
    setIsLoading(true);
    try {
      let data = await getAllPersonas();
      
      // Apply filters based on the props
      if (filterByCurrentUser && user) {
        data = data.filter(persona => persona.created_by === user.id);
      }
      
      if (publicOnly) {
        data = data.filter(persona => persona.is_public);
      }
      
      if (collectionId) {
        // This would require an API call to get personas in a specific collection
        // For now, we'll leave this as a placeholder
        console.log(`Should filter by collection ID: ${collectionId}`);
      }
      
      console.log("Fetched personas:", data);
      console.log("Number of personas:", data.length);
      
      setPersonas(data);
      onPersonasLoad?.(data);
    } catch (error) {
      console.error("Error loading personas:", error);
      toast.error("Failed to load personas");
    } finally {
      setIsLoading(false);
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
        <PersonaCard key={persona.persona_id} persona={persona} />
      ))}
    </div>
  );
}
