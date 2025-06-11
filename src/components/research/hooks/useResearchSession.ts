
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createResearchSession } from '../services/sessionService';
import { sendResearchMessage } from '../services/messageService';
import { ResearchMessage, LoadedPersona } from './types';

export const useResearchSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<LoadedPersona[]>([]);
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(async (personaIds: string[], objective?: string): Promise<boolean> => {
    console.log('Creating research session with personas:', personaIds, 'objective:', objective);
    
    try {
      setIsLoading(true);
      const session = await createResearchSession(personaIds);
      
      setSessionId(session.sessionId);
      setLoadedPersonas(session.personas);
      setMessages([]);
      
      // If we have an objective, add it as the first user message
      if (objective && objective.trim()) {
        const systemMessage: ResearchMessage = {
          role: 'user',
          content: `Research Objective: ${objective.trim()}`,
          timestamp: new Date(),
          sessionId: session.sessionId
        };
        setMessages([systemMessage]);
      }
      
      toast.success(`Research session started with ${session.personas.length} personas`);
      console.log('Session created successfully:', session.sessionId);
      return true;
    } catch (error) {
      console.error('Failed to create research session:', error);
      toast.error('Failed to create research session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, imageFile?: File): Promise<void> => {
    if (!sessionId) {
      toast.error('No active research session');
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ResearchMessage = {
        role: 'user',
        content,
        timestamp: new Date(),
        sessionId
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send message and get response
      const response = await sendResearchMessage(sessionId, content, loadedPersonas);
      
      // Add persona response
      const responseMessage: ResearchMessage = {
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

  const selectPersonaResponder = useCallback(async (personaId: string): Promise<void> => {
    if (!sessionId || messages.length === 0) {
      toast.error('No active research session or messages');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the last user message
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (!lastUserMessage) {
        toast.error('No user message found to respond to');
        return;
      }
      
      const response = await sendResearchMessage(sessionId, lastUserMessage.content, loadedPersonas, personaId);
      
      const responseMessage: ResearchMessage = {
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
  }, [sessionId, loadedPersonas, messages]);

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
