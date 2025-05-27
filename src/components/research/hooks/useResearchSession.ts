
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePersona } from '@/hooks/usePersona';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';

export const useResearchSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [messages, setMessages] = useState<(Message & { responding_persona_id?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  
  const { personas, loadPersonas } = usePersona();

  const createSession = useCallback(async (personaIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get the user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to start a research session');
        return false;
      }

      // Load full persona data
      await loadPersonas();
      const selectedPersonas = (personas || []).filter(p => 
        personaIds.includes(p.persona_id)
      );
      
      if (selectedPersonas.length === 0) {
        toast.error('No valid personas selected');
        return false;
      }

      // Create research conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          title: `Research Session - ${new Date().toLocaleDateString()}`,
          session_type: 'research',
          active_persona_ids: personaIds,
          auto_mode: autoMode,
          persona_ids: personaIds,
          project_id: 'research-session', // We'll create a default research project later
          user_id: user.id,
          tags: ['research']
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(conversation.id);
      setLoadedPersonas(selectedPersonas);
      setMessages([]);
      
      toast.success('Research session started successfully');
      return true;
    } catch (error) {
      console.error('Error creating research session:', error);
      toast.error('Failed to start research session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [personas, loadPersonas, autoMode]);

  const sendMessage = useCallback(async (content: string, imageFile?: File | null) => {
    if (!sessionId || !content.trim()) return;

    try {
      setIsLoading(true);

      // Add user message to local state
      const userMessage: Message & { responding_persona_id?: string } = {
        role: 'user',
        content,
        timestamp: new Date(),
        image: imageFile ? await convertFileToBase64(imageFile) : undefined
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'user',
          content,
          persona_id: null,
          responding_persona_id: null
        });

      // In auto mode, automatically select next responder
      if (autoMode && loadedPersonas.length > 0) {
        // Simple logic: rotate through personas or use random selection
        const lastPersonaMessage = [...messages].reverse().find(m => m.responding_persona_id);
        let nextPersonaIndex = 0;
        
        if (lastPersonaMessage) {
          const lastPersonaIndex = loadedPersonas.findIndex(p => 
            p.persona_id === lastPersonaMessage.responding_persona_id
          );
          nextPersonaIndex = (lastPersonaIndex + 1) % loadedPersonas.length;
        }
        
        const nextPersona = loadedPersonas[nextPersonaIndex];
        await generatePersonaResponse(nextPersona.persona_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, autoMode, loadedPersonas, messages]);

  const selectPersonaResponder = useCallback(async (personaId: string) => {
    await generatePersonaResponse(personaId);
  }, []);

  const generatePersonaResponse = useCallback(async (personaId: string) => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      
      const persona = loadedPersonas.find(p => p.persona_id === personaId);
      if (!persona) return;

      // Create context about other personas in the session
      const otherPersonas = loadedPersonas.filter(p => p.persona_id !== personaId);
      const personaContext = otherPersonas.length > 0 
        ? `\n\nOther participants in this research session: ${otherPersonas.map(p => 
            `${p.name} (${p.metadata?.occupation || 'Unknown occupation'})`
          ).join(', ')}`
        : '';

      // Get the last user message
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (!lastUserMessage) return;

      // Generate response using existing persona chat service
      const response = await sendMessageToPersona(
        personaId,
        lastUserMessage.content + personaContext,
        messages,
        persona,
        'conversation',
        `This is a research conversation with multiple AI personas. You are participating alongside other personas. Please provide thoughtful, authentic responses based on your persona characteristics.${personaContext}`,
        lastUserMessage.image
      );

      // Add persona response to messages
      const assistantMessage: Message & { responding_persona_id?: string } = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        responding_persona_id: personaId
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to database
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'assistant',
          content: response,
          persona_id: personaId,
          responding_persona_id: personaId
        });

    } catch (error) {
      console.error('Error generating persona response:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, loadedPersonas, messages]);

  const addPersonaToSession = useCallback(async (personaId: string) => {
    // Implementation for adding persona to existing session
    // This would update the active_persona_ids array
  }, [sessionId]);

  const removePersonaFromSession = useCallback(async (personaId: string) => {
    // Implementation for removing persona from session
    // This would update the active_persona_ids array
  }, [sessionId]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    autoMode,
    setAutoMode,
    createSession,
    addPersonaToSession,
    removePersonaFromSession,
    sendMessage,
    selectPersonaResponder
  };
};
