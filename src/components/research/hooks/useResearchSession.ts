
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Message } from '@/components/persona-chat/types';
import { ResearchMessage, ResearchSessionHookReturn } from '../types';
import { getAllPersonas } from '@/services/persona';
import { useResearchState } from './useResearchState';
import { sessionService } from '../services/sessionService';
import { personaResponseService } from '../services/personaResponseService';

export const useResearchSession = (): ResearchSessionHookReturn => {
  const researchState = useResearchState();

  const createSession = useCallback(async (selectedPersonaIds: string[], projectId?: string | null): Promise<boolean> => {
    if (selectedPersonaIds.length === 0) {
      toast.error('Please select at least one persona');
      return false;
    }

    researchState.actions.setIsLoading(true);

    try {
      // Load all personas to get full persona objects
      const allPersonas = await getAllPersonas();
      const selectedPersonas = allPersonas.filter(p => 
        selectedPersonaIds.includes(p.persona_id)
      );

      if (selectedPersonas.length !== selectedPersonaIds.length) {
        throw new Error('Some selected personas could not be found');
      }

      // Create session with project context
      const sessionId = await sessionService.createSession(selectedPersonaIds, projectId);
      
      // Update state
      researchState.actions.setSessionId(sessionId);
      researchState.actions.setLoadedPersonas(selectedPersonas);
      
      toast.success(`Research session created with ${selectedPersonas.length} personas`);
      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(`Failed to create research session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      researchState.actions.setIsLoading(false);
    }
  }, [researchState.actions]);

  const sendMessage = useCallback(async (message: string, imageFile?: File | null): Promise<void> => {
    if (!message.trim() || !researchState.sessionId) return;

    const userMessage: ResearchMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      file: imageFile || undefined,
    };

    researchState.actions.addMessage(userMessage);
    researchState.actions.setIsLoading(true);

    try {
      await sessionService.addMessage(researchState.sessionId, message, 'user');
      console.log('User message added to research session');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      researchState.actions.setIsLoading(false);
    }
  }, [researchState.sessionId, researchState.actions]);

  const selectPersonaResponder = useCallback(async (personaId: string): Promise<void> => {
    if (!researchState.sessionId) return;

    const persona = researchState.loadedPersonas.find(p => p.persona_id === personaId);
    if (!persona) {
      toast.error('Persona not found');
      return;
    }

    researchState.actions.setSelectedPersonaId(personaId);
    researchState.actions.setIsLoading(true);

    try {
      const response = await personaResponseService.generatePersonaResponse(
        personaId,
        researchState.messages,
        persona
      );

      const assistantMessage: ResearchMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        responding_persona_id: personaId,
      };

      researchState.actions.addMessage(assistantMessage);
      
      // Add to session
      await sessionService.addMessage(researchState.sessionId, response, 'assistant', personaId);
      
      toast.success(`${persona.name} has responded`);
    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error(`Failed to get response from ${persona.name}`);
    } finally {
      researchState.actions.setIsLoading(false);
      researchState.actions.setSelectedPersonaId(null);
    }
  }, [researchState.sessionId, researchState.loadedPersonas, researchState.messages, researchState.actions]);

  return {
    // State
    sessionId: researchState.sessionId,
    loadedPersonas: researchState.loadedPersonas,
    messages: researchState.messages,
    isLoading: researchState.isLoading,
    selectedPersonaId: researchState.selectedPersonaId,
    
    // Actions
    createSession,
    sendMessage,
    selectPersonaResponder,
    
    // State management actions
    clearSession: researchState.actions.clearSession,
    resetState: researchState.actions.resetState,
  };
};
