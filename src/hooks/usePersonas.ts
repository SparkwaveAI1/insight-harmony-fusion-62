import { useQuery } from "@tanstack/react-query";
import { getAllPersonas, getPersonaById } from "@/services/persona";

export function usePersonas(lightweight = false) {
  return useQuery({
    queryKey: ['personas', lightweight],
    queryFn: () => getAllPersonas(),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

export function usePersona(personaId: string | null) {
  return useQuery({
    queryKey: ['persona', personaId],
    queryFn: () => personaId ? getPersonaById(personaId) : null,
    enabled: !!personaId,
    staleTime: 30000,
  });
}

export function usePersonaVersionStats() {
  return useQuery({
    queryKey: ['persona-version-stats'],
    queryFn: async () => {
      const personas = await getAllPersonas();
      return {
        total: personas.length,
        v2: personas.length, // All are V2 now
        v1: 0 // No V1 personas exist
      };
    },
    staleTime: 60000, // Consider stats fresh for 1 minute
  });
}