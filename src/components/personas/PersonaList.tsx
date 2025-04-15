
import { useState, useEffect } from "react";
import { getAllPersonas } from "@/services/persona/personaService";
import { toast } from "sonner";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import PersonaCard from "./PersonaCard";

export default function PersonaList() {
  const [personas, setPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPersonas();
      setPersonas(data);
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
