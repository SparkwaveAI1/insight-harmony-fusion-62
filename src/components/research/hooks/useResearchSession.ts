import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { mapDbPersonaToPersona } from '@/services/persona/mappers';

interface ResearchSessionState {
  personas: Persona[];
  activePersonaIds: string[];
  title: string;
  description: string;
}

interface ResearchSessionActions {
  loadPersonas: () => Promise<void>;
  addPersona: (personaId: string) => void;
  removePersona: (personaId: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
}

export const useResearchSession = () => {
  const [session, setSession] = useState<ResearchSessionState>({
    personas: [],
    activePersonaIds: [],
    title: '',
    description: '',
  });

  const loadPersonas = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching personas:', error);
        return;
      }

      const personas = data.map(mapDbPersonaToPersona);
      setSession(prev => ({ ...prev, personas }));
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  }, []);

  const addPersona = useCallback((personaId: string) => {
    setSession(prev => ({
      ...prev,
      activePersonaIds: [...prev.activePersonaIds, personaId],
    }));
  }, []);

  const removePersona = useCallback((personaId: string) => {
    setSession(prev => ({
      ...prev,
      activePersonaIds: prev.activePersonaIds.filter(id => id !== personaId),
    }));
  }, []);

  const setTitle = useCallback((title: string) => {
    setSession(prev => ({ ...prev, title }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setSession(prev => ({ ...prev, description }));
  }, []);

  return {
    ...session,
    loadPersonas,
    addPersona,
    removePersona,
    setTitle,
    setDescription,
  };
};
