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
  sendToPersona: (personaId: string) => Promise<string>;
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
      console.log('Loading project documents for project:', projectId);
      loadProjectDocuments();
    }
  }, [projectId]);

  const loadProjectDocuments = async () => {
    if (!projectId) return;
    
    try {
      console.log('Fetching documents for project:', projectId);
      const docs = await getProjectDocuments(projectId);
      console.log('Loaded project documents:', docs.length);
      setProjectDocuments(docs);
    } catch (error) {
      console.error('Error loading project documents:', error);
    }
  };

  const createSession = async (personaIds: string[], selectedProjectId?: string): Promise<boolean> => {
    console.log('=== CREATE SESSION START ===');
    console.log('Persona IDs:', personaIds);
    console.log('Selected Project ID:', selectedProjectId);
    console.log('Hook Project ID:', projectId);
    
    try {
      setIsLoading(true);
      
      // Use provided projectId or the one from props
      const useProjectId = selectedProjectId || projectId;
      console.log('Final Project ID to use:', useProjectId);
      
      if (!useProjectId) {
        const error = 'Project ID is required to create a research session';
        console.error(error);
        toast.error(error);
        return false;
      }

      if (!personaIds || personaIds.length === 0) {
        const error = 'At least one persona must be selected';
        console.error(error);
        toast.error(error);
        return false;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        toast.error('Authentication error');
        return false;
      }
      
      if (!user) {
        const error = 'User must be authenticated';
        console.error(error);
        toast.error(error);
        return false;
      }

      console.log('User authenticated:', user.id);

      // Verify project exists and user has access
      try {
        const project = await getProjectById(useProjectId);
        console.log('Project verified:', project?.name);
      } catch (projectError) {
        console.error('Project verification failed:', projectError);
        toast.error('Failed to access project. Please check your permissions.');
        return false;
      }

      // Create conversation session using existing conversations table
      console.log('Creating conversation session...');
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

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        toast.error(`Failed to create session: ${sessionError.message}`);
        return false;
      }

      console.log('Session created:', session.id);
      setSessionId(session.id);

      // Load personas using the existing database query
      console.log('Loading personas...');
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .in('persona_id', personaIds);

      if (personasError) {
        console.error('Personas loading error:', personasError);
        toast.error(`Failed to load personas: ${personasError.message}`);
        return false;
      }

      if (!personasData || personasData.length === 0) {
        console.error('No personas found with provided IDs');
        toast.error('No personas found. Please check your selection.');
        return false;
      }

      // Use the existing dbPersonaToPersona mapper to ensure proper type conversion
      const mappedPersonas: Persona[] = personasData.map(dbPersona => 
        dbPersonaToPersona(dbPersona)
      );

      console.log('Personas loaded:', mappedPersonas.length);
      setLoadedPersonas(mappedPersonas);
      setMessages([]);

      toast.success(`Research session started successfully with ${mappedPersonas.length} personas`);
      console.log('=== CREATE SESSION SUCCESS ===');
      return true;
    } catch (error) {
      console.error('Error creating research session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create research session: ${errorMessage}`);
      console.log('=== CREATE SESSION FAILED ===');
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

  // Send current conversation to selected persona and return the response
  const sendToPersona = async (personaId: string): Promise<string> => {
    if (!sessionId) {
      toast.error('No active session');
      throw new Error('No active session');
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
        throw new Error('No user message to send to persona');
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
      
      return response; // Return the actual response text

    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error('Failed to get persona response');
      throw error;
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
