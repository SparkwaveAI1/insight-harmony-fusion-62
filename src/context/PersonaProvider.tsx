
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPersonaByPersonaId } from '@/services/persona/personaService';
import { Persona } from '@/services/persona/types';
import { PersonaContextType } from './PersonaContext.types';
import { supabase } from '@/integrations/supabase/client';

// Create context with undefined default value
export const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [activePersonaIds, setActivePersonaIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  // Fetch active persona using React Query
  const {
    data: activePersona,
    isLoading,
    error
  } = useQuery({
    queryKey: ['persona', activePersonaId],
    queryFn: () => activePersonaId ? getPersonaByPersonaId(activePersonaId) : null,
    enabled: !!activePersonaId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
  
  // Fetch multiple personas (for focus groups, etc.)
  const { data: activePersonas = [] } = useQuery({
    queryKey: ['personas', activePersonaIds],
    queryFn: async () => {
      if (!activePersonaIds.length) return [];
      
      // Fetch all personas in parallel
      const personasPromises = activePersonaIds.map(id => 
        getPersonaByPersonaId(id).catch(err => {
          console.error(`Failed to load persona ${id}:`, err);
          return null;
        })
      );
      
      const results = await Promise.all(personasPromises);
      // Filter out any failed fetches
      return results.filter(Boolean) as Persona[];
    },
    enabled: activePersonaIds.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  // Load a single persona
  const loadPersona = useCallback(async (personaId: string) => {
    try {
      console.log(`Loading persona: ${personaId}`);
      setActivePersonaId(personaId);
      
      // We can prefetch here to make it immediately available
      const persona = await queryClient.fetchQuery({
        queryKey: ['persona', personaId],
        queryFn: () => getPersonaByPersonaId(personaId),
      });
      
      if (!persona) {
        toast.error("Persona not found");
        return null;
      }
      
      return persona;
    } catch (error) {
      console.error('Error loading persona:', error);
      toast.error('Failed to load persona');
      return null;
    }
  }, [queryClient]);
  
  // Load multiple personas
  const loadMultiplePersonas = useCallback(async (personaIds: string[]) => {
    try {
      console.log(`Loading multiple personas: ${personaIds.join(', ')}`);
      setActivePersonaIds(personaIds);
      
      // Prefetch all personas
      const personas = await Promise.all(
        personaIds.map(id => 
          queryClient.fetchQuery({
            queryKey: ['persona', id],
            queryFn: () => getPersonaByPersonaId(id),
          })
        )
      );
      
      return personas.filter(Boolean) as Persona[];
    } catch (error) {
      console.error('Error loading multiple personas:', error);
      toast.error('Failed to load one or more personas');
      return [];
    }
  }, [queryClient]);
  
  // Clear the active persona
  const clearPersona = useCallback(() => {
    setActivePersonaId(null);
  }, []);
  
  // Clear all active personas
  const clearPersonas = useCallback(() => {
    setActivePersonaIds([]);
  }, []);
  
  const contextValue: PersonaContextType = {
    activePersona: activePersona || null,
    isLoading,
    error: error as Error | null,
    activePersonas: activePersonas || [],
    loadPersona,
    loadMultiplePersonas,
    clearPersona,
    clearPersonas,
  };
  
  return (
    <PersonaContext.Provider value={contextValue}>
      {children}
    </PersonaContext.Provider>
  );
};
