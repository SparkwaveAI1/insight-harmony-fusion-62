import { useState, useCallback } from 'react';
import { Persona } from '@/services/persona/types';
import { ResearchMessage } from './types';
import { createResearchSession } from '../services/sessionService';
import { sendUserMessage } from '../services/messageService';
import { generatePersonaResponse } from '../services/personaResponseService';

export const useResearchSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(async (personaIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await createResearchSession(personaIds);
      
      if (result.success && result.sessionId && result.selectedPersonas) {
        setSessionId(result.sessionId);
        setLoadedPersonas(result.selectedPersonas);
        setMessages([]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in createSession:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, imageFile?: File | null) => {
    if (!sessionId || !content.trim()) {
      console.log('Cannot send message - missing sessionId or content:', { sessionId, hasContent: !!content.trim() });
      return;
    }

    try {
      setIsLoading(true);
      
      const userMessage = await sendUserMessage(sessionId, content, imageFile);
      
      console.log('Adding user message to state');
      setMessages(prev => {
        const newMessages = [...prev, userMessage];
        console.log('Updated messages:', newMessages.length);
        return newMessages;
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const selectPersonaResponder = useCallback(async (personaId: string) => {
    console.log('Selecting persona responder:', personaId);
    
    // Use current values from state, not from closure
    setMessages(currentMessages => {
      setLoadedPersonas(currentPersonas => {
        setSessionId(currentSessionId => {
          if (currentSessionId) {
            // Handle the async response generation
            setIsLoading(true);
            generatePersonaResponse(personaId, currentSessionId, currentMessages, currentPersonas)
              .then(responseMessage => {
                if (responseMessage) {
                  setMessages(prev => [...prev, responseMessage]);
                }
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else {
            console.error('No session ID available');
          }
          return currentSessionId;
        });
        return currentPersonas;
      });
      return currentMessages;
    });
  }, []);

  const addPersonaToSession = useCallback(async (personaId: string) => {
    // Implementation for adding persona to existing session
    // This would update the active_persona_ids array
  }, [sessionId]);

  const removePersonaFromSession = useCallback(async (personaId: string) => {
    // Implementation for removing persona from session
    // This would update the active_persona_ids array
  }, [sessionId]);

  return {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    createSession,
    addPersonaToSession,
    removePersonaFromSession,
    sendMessage,
    selectPersonaResponder
  };
};
