
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { dbPersonaToPersona } from '@/services/persona/mappers';
import { getProjectById, getProjectDocuments } from '@/services/collections';
import { processMessageWithFile, ResearchMessage } from '../services/messageService';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';
import { Message } from '@/components/persona-chat/types';

export interface UseResearchSessionReturn {
  sessionId: string | null;
  loadedPersonas: Persona[];
  projectDocuments: any[];
  messages: (Message & { responding_persona_id?: string })[];
  isLoading: boolean;
  createSession: (personaIds: string[], projectId?: string) => Promise<boolean>;
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  sendToPersona: (personaId: string) => Promise<void>;
}

export const useResearchSession = (projectId?: string): UseResearchSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<(Message & { responding_persona_id?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load project documents when projectId changes
  useEffect(() => {
    if (projectId) {
      loadProjectDocuments();
    }
  }, [projectId]);

  const loadProjectDocuments = async () => {
    if (!projectId) return;
    
    try {
      const docs = await getProjectDocuments(projectId);
      setProjectDocuments(docs);
    } catch (error) {
      console.error('Error loading project documents:', error);
    }
  };

  const createSession = async (personaIds: string[], selectedProjectId?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Use provided projectId or the one from props
      const useProjectId = selectedProjectId || projectId;
      
      if (!useProjectId) {
        throw new Error('Project ID is required');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Create conversation session using existing conversations table
      const { data: session, error: sessionError } = await supabase
        .from('conversations')
        .insert({
          project_id: useProjectId,
          persona_ids: personaIds,
          title: `Research Session - ${new Date().toLocaleDateString()}`,
          user_id: user.id,
          session_type: 'research',
          active_persona_ids: personaIds
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);

      // Load personas using the existing database query
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .in('persona_id', personaIds);

      if (personasError) throw personasError;

      // Use the existing dbPersonaToPersona mapper to ensure proper type conversion
      const mappedPersonas: Persona[] = (personasData || []).map(dbPersona => 
        dbPersonaToPersona(dbPersona)
      );

      setLoadedPersonas(mappedPersonas);
      setMessages([]);

      toast.success('Research session started successfully');
      return true;
    } catch (error) {
      console.error('Error creating research session:', error);
      toast.error('Failed to create research session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add user message to chat without sending to personas yet
  const sendMessage = async (message: string, imageFile?: File | null): Promise<void> => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }

    try {
      setIsLoading(true);

      // Process the message and file
      const { content, imageData, extractedText } = await processMessageWithFile(message, imageFile);

      // Add user message to UI immediately
      const userMessage: Message = {
        role: 'user',
        content: content,
        timestamp: new Date(),
        ...(imageData && { image: imageData })
      };

      setMessages(prev => [...prev, userMessage]);

      // Store message in database
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'user',
          content: content,
          file_attachments: imageData || extractedText ? [{
            type: imageData ? 'image' : 'document',
            data: imageData,
            extracted_text: extractedText
          }] : []
        });

      if (error) {
        console.error('Error storing research message:', error);
        throw error;
      }

      console.log('User message added to chat, waiting for persona selection');

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Send current conversation to selected persona
  const sendToPersona = async (personaId: string): Promise<void> => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }

    try {
      setIsLoading(true);

      // Find the persona
      const activePersona = loadedPersonas.find(p => p.persona_id === personaId);
      if (!activePersona) {
        throw new Error('Persona not found');
      }

      console.log('Sending conversation to persona:', activePersona.name);

      // Get the last user message
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        toast.error('No user message to send to persona');
        return;
      }

      // Format previous messages for the API
      const previousMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image: msg.image
      }));

      // Create knowledge base context from project documents
      const knowledgeBaseContext = projectDocuments.length > 0 
        ? `KNOWLEDGE BASE AVAILABLE - You have access to the following documents: ${projectDocuments.map(doc => `"${doc.title}"`).join(', ')}. Key information from these documents:\n\n${projectDocuments.map(doc => 
            doc.content ? `${doc.title}:\n${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}` : `${doc.title}: [Document uploaded but content not extracted]`
          ).join('\n\n')}\n\nUse this information to inform your responses when relevant to the conversation.`
        : '';

      // Get persona response using the unified conversation engine
      const response = await sendMessageToPersona(
        personaId,
        lastUserMessage.content,
        previousMessages,
        activePersona,
        'research', // Use research mode
        knowledgeBaseContext, // Pass the knowledge base context
        lastUserMessage.image
      );
      
      // Add persona response to messages
      const personaMessage: Message & { responding_persona_id: string } = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        responding_persona_id: personaId
      };

      setMessages(prev => [...prev, personaMessage]);

      // Store persona response in database
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'assistant',
          content: response,
          persona_id: personaId,
          responding_persona_id: personaId
        });

      console.log('Persona response generated and added to conversation');

    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error('Failed to get persona response');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    sendToPersona
  };
};
