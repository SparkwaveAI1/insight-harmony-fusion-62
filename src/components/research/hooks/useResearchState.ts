
import { useState, useCallback } from 'react';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';

export interface ResearchState {
  sessionId: string | null;
  loadedPersonas: Persona[];
  messages: Message[];
  isLoading: boolean;
  selectedPersonaId: string | null;
}

export interface ResearchActions {
  setSessionId: (sessionId: string | null) => void;
  setLoadedPersonas: (personas: Persona[]) => void;
  addPersona: (persona: Persona) => void;
  removePersona: (personaId: string) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedPersonaId: (personaId: string | null) => void;
  clearSession: () => void;
  resetState: () => void;
}

const initialState: ResearchState = {
  sessionId: null,
  loadedPersonas: [],
  messages: [],
  isLoading: false,
  selectedPersonaId: null,
};

export const useResearchState = () => {
  const [state, setState] = useState<ResearchState>(initialState);

  const setSessionId = useCallback((sessionId: string | null) => {
    setState(prev => ({ ...prev, sessionId }));
  }, []);

  const setLoadedPersonas = useCallback((personas: Persona[]) => {
    setState(prev => ({ ...prev, loadedPersonas: personas }));
  }, []);

  const addPersona = useCallback((persona: Persona) => {
    setState(prev => ({
      ...prev,
      loadedPersonas: [...prev.loadedPersonas, persona]
    }));
  }, []);

  const removePersona = useCallback((personaId: string) => {
    setState(prev => ({
      ...prev,
      loadedPersonas: prev.loadedPersonas.filter(p => p.persona_id !== personaId)
    }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const addMessages = useCallback((messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, ...messages]
    }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setSelectedPersonaId = useCallback((personaId: string | null) => {
    setState(prev => ({ ...prev, selectedPersonaId: personaId }));
  }, []);

  const clearSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessionId: null,
      messages: [],
      selectedPersonaId: null,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const actions: ResearchActions = {
    setSessionId,
    setLoadedPersonas,
    addPersona,
    removePersona,
    addMessage,
    addMessages,
    setIsLoading,
    setSelectedPersonaId,
    clearSession,
    resetState,
  };

  return {
    ...state,
    actions,
  };
};
