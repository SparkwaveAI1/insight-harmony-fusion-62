import { useEffect, useState } from "react";
import { PersonaV3 } from "@/types/persona-v3";
import { getV3Personas } from "@/services/persona/v3Operations/getV3Personas";
import { V3PersonaCard } from "./V3PersonaCard";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface V3PersonaListProps {
  refreshTrigger?: number;
}

export function V3PersonaList({ refreshTrigger }: V3PersonaListProps) {
  const [personas, setPersonas] = useState<PersonaV3[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPersonas = async () => {
    try {
      console.log('🔄 V3-Clean: Fetching personas...');
      setLoading(true);
      const fetchedPersonas = await getV3Personas();
      setPersonas(fetchedPersonas);
      console.log(`✅ V3-Clean: Loaded ${fetchedPersonas.length} personas`);
    } catch (error) {
      console.error('❌ V3-Clean: Failed to fetch personas:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load V3 personas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [refreshTrigger]);

  const handlePersonaDeleted = (personaId: string) => {
    setPersonas(prev => prev.filter(p => p.persona_id !== personaId));
    toast({
      title: "Persona Deleted",
      description: "The persona has been removed successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading V3 personas...</p>
        </div>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No V3 Personas Yet</h3>
        <p className="text-muted-foreground">
          Create your first V3 persona using the generator above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your V3 Personas</h2>
        <span className="text-sm text-muted-foreground">
          {personas.length} persona{personas.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <V3PersonaCard
            key={persona.persona_id}
            persona={persona}
            onDeleted={handlePersonaDeleted}
          />
        ))}
      </div>
    </div>
  );
}