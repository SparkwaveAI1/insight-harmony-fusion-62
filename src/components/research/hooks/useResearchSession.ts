import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';
import { supabase } from '@/integrations/supabase/client';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';

export const useResearchSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [messages, setMessages] = useState<(Message & { responding_persona_id?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { personas } = usePersona();

  const createSession = useCallback(async (personaIds: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Creating session with personas:', personaIds);
      
      // Get the user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to start a research session');
        return false;
      }

      // Get selected personas from the already loaded personas
      const selectedPersonas = (personas || []).filter(p => 
        personaIds.includes(p.persona_id)
      );
      
      console.log('Selected personas:', selectedPersonas);
      
      if (selectedPersonas.length === 0) {
        toast.error('No valid personas selected');
        return false;
      }

      // First, create or get a default research project
      let projectId: string;
      
      // Try to find an existing research project for this user
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Research Sessions')
        .limit(1);

      if (existingProjects && existingProjects.length > 0) {
        projectId = existingProjects[0].id;
      } else {
        // Create a new research project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: 'Research Sessions',
            description: 'Default project for research sessions',
            user_id: user.id
          })
          .select('id')
          .single();

        if (projectError) throw projectError;
        projectId = newProject.id;
      }

      // Create research conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          title: `Research Session - ${new Date().toLocaleDateString()} (${selectedPersonas.length} personas)`,
          session_type: 'research',
          active_persona_ids: personaIds,
          auto_mode: false,
          persona_ids: personaIds,
          project_id: projectId,
          user_id: user.id,
          tags: ['research']
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(conversation.id);
      setLoadedPersonas(selectedPersonas);
      setMessages([]);
      
      console.log('Session created successfully:', conversation.id);
      toast.success(`Research session started with ${selectedPersonas.length} persona${selectedPersonas.length !== 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error creating research session:', error);
      toast.error('Failed to start research session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [personas]);

  const sendMessage = useCallback(async (content: string, imageFile?: File | null) => {
    if (!sessionId || !content.trim()) {
      console.log('Cannot send message - missing sessionId or content:', { sessionId, hasContent: !!content.trim() });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending message:', content);

      // Add user message to local state
      const userMessage: Message & { responding_persona_id?: string } = {
        role: 'user',
        content,
        timestamp: new Date(),
        image: imageFile ? await convertFileToBase64(imageFile) : undefined
      };

      console.log('Adding user message to state');
      setMessages(prev => {
        const newMessages = [...prev, userMessage];
        console.log('Updated messages:', newMessages.length);
        return newMessages;
      });

      // Save user message to database
      const { error: dbError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'user',
          content,
          persona_id: null,
          responding_persona_id: null
        });

      if (dbError) {
        console.error('Error saving message to database:', dbError);
      } else {
        console.log('Message saved to database successfully');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const selectPersonaResponder = useCallback(async (personaId: string) => {
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Generating response for persona:', personaId);
      
      const persona = loadedPersonas.find(p => p.persona_id === personaId);
      if (!persona) {
        console.error('Persona not found:', personaId);
        toast.error('Selected persona not found');
        return;
      }

      console.log('Current conversation messages:', messages.length);

      // Build the complete conversation history for context
      const conversationHistory: Message[] = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
        timestamp: m.timestamp,
        image: m.image
      }));

      console.log('Conversation history being sent:', conversationHistory.map(m => `${m.role}: ${m.content.substring(0, 50)}...`));

      // Create a comprehensive prompt that includes the conversation context
      const contextualPrompt = messages.length > 0 
        ? `Based on our conversation so far, please provide your thoughts and perspective. Here's the context of what we've been discussing: ${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`
        : 'Please introduce yourself and share your thoughts on the topic we\'re discussing.';

      // Generate response using existing persona chat service with research mode
      const response = await sendMessageToPersona(
        personaId,
        contextualPrompt,
        conversationHistory,
        persona,
        'research',
        `This is a research conversation. You should respond to the ongoing conversation context, taking into account everything that has been discussed so far. Look at the conversation history to understand what has been discussed and provide your perspective as ${persona.name}.`,
        messages.length > 0 ? messages[messages.length - 1].image : undefined
      );

      console.log('Generated response:', response.substring(0, 100) + '...');

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

      console.log('Response saved successfully');

    } catch (error) {
      console.error('Error generating persona response:', error);
      toast.error(`Failed to generate response from ${loadedPersonas.find(p => p.persona_id === personaId)?.name || 'persona'}`);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages, loadedPersonas]);

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
    createSession,
    sendMessage,
    selectPersonaResponder
  };
};
