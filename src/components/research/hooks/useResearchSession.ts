
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createResearchSession } from '../services/sessionService';
import { sendResearchMessage } from '../services/messageService';
import { ResearchMessage, ResearchSession, LoadedPersona } from './types';

export const useResearchSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<LoadedPersona[]>([]);
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(async (personaIds: string[], objective?: string) => {
    console.log('Creating research session with personas:', personaIds, 'objective:', objective);
    
    try {
      setIsLoading(true);
      const session = await createResearchSession(personaIds);
      
      setSessionId(session.sessionId);
      setLoadedPersonas(session.personas);
      setMessages([]);
      
      // If we have an objective, add it as the first system message
      if (objective && objective.trim()) {
        const systemMessage: ResearchMessage = {
          id: 'objective-' + Date.now(),
          role: 'system',
          content: `Research Objective: ${objective.trim()}`,
          timestamp: new Date(),
          sessionId: session.sessionId
        };
        setMessages([systemMessage]);
      }
      
      toast.success(`Research session started with ${session.personas.length} personas`);
      console.log('Session created successfully:', session.sessionId);
    } catch (error) {
      console.error('Failed to create research session:', error);
      toast.error('Failed to create research session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, targetPersonaId?: string) => {
    if (!sessionId) {
      toast.error('No active research session');
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ResearchMessage = {
        id: 'user-' + Date.now(),
        role: 'user',
        content,
        timestamp: new Date(),
        sessionId,
        targetPersonaId
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send message and get response
      const response = await sendResearchMessage(sessionId, content, loadedPersonas, targetPersonaId);
      
      // Add persona response
      const responseMessage: ResearchMessage = {
        id: 'persona-' + Date.now(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sessionId,
        personaId: response.personaId,
        personaName: response.personaName
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, loadedPersonas]);

  const selectPersonaResponder = useCallback(async (personaId: string, originalMessage: string) => {
    if (!sessionId) {
      toast.error('No active research session');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await sendResearchMessage(sessionId, originalMessage, loadedPersonas, personaId);
      
      const responseMessage: ResearchMessage = {
        id: 'selected-' + Date.now(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sessionId,
        personaId: response.personaId,
        personaName: response.personaName
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
    } catch (error) {
      console.error('Failed to get persona response:', error);
      toast.error('Failed to get persona response');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, loadedPersonas]);

  return {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    createSession,
    sendMessage,
    selectPersonaResponder
  };
};
