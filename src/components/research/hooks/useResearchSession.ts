import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { dbPersonaToPersona } from '@/services/persona/mappers';
import { getProjectById, getProjectDocuments } from '@/services/collections';
import { processMessageWithFile, ResearchMessage } from '../services/messageService';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';
import { Message } from '@/components/persona-chat/types';
import { processPersonasInParallel } from '../utils/parallelProcessing';

export interface UseResearchSessionReturn {
  sessionId: string | null;
  loadedPersonas: Persona[];
  projectDocuments: any[];
  messages: (Message & { responding_persona_id?: string })[];
  personaConversations: Map<string, (Message & { responding_persona_id?: string })[]>;
  isLoading: boolean;
  createSession: (personaIds: string[], projectId?: string) => Promise<boolean>;
  sendMessage: (message: string, imageFile?: File | null) => Promise<Message>;
  sendToPersona: (personaId: string, userMessage?: Message) => Promise<string>;
  sendToAllPersonas: (userMessage: Message) => Promise<void>;
}

export const useResearchSession = (projectId?: string): UseResearchSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<(Message & { responding_persona_id?: string })[]>([]);
  const [personaConversations, setPersonaConversations] = useState<Map<string, (Message & { responding_persona_id?: string })[]>>(new Map());
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
      
      // Use provided projectId or the one from props (can be null for persona chats)
      const useProjectId = selectedProjectId || projectId || null;
      
      console.log('Final Project ID to use:', useProjectId || 'null (persona chat)');

      if (!personaIds || personaIds.length === 0) {
        const error = 'At least one persona must be selected';
        console.error(error);
        toast.error(error);
        return false;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        toast.error('Authentication required');
        return false;
      }

      console.log('User authenticated:', user.id);

      // Verify project exists and user has access (only if projectId is provided)
      if (useProjectId) {
        try {
          const project = await getProjectById(useProjectId);
          console.log('Project verified:', project?.name);
        } catch (projectError) {
          console.error('Project verification failed:', projectError);
          toast.error('Failed to access project. Please check your permissions.');
          return false;
        }
      }

      // Create conversation session using existing conversations table
      console.log('Creating conversation session...');
      const { data: session, error: sessionError } = await supabase
        .from('conversations')
        .insert({
          project_id: useProjectId,
          persona_ids: personaIds,
          title: useProjectId ? `Research Session - ${new Date().toLocaleDateString()}` : `Persona Chat - ${new Date().toLocaleDateString()}`,
          user_id: user.id,
          session_type: useProjectId ? 'research' : 'chat',
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
      
      // Initialize individual conversation maps for each persona
      const newConversations = new Map<string, (Message & { responding_persona_id?: string })[]>();
      mappedPersonas.forEach(persona => {
        newConversations.set(persona.persona_id, []);
      });
      setPersonaConversations(newConversations);

      const sessionType = useProjectId ? 'research session' : 'persona chat';
      toast.success(`${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} started successfully with ${mappedPersonas.length} personas`);
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

  const sendMessage = async (message: string, imageFile?: File | null): Promise<Message> => {
    if (!sessionId) {
      toast.error('No active session');
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);

      // Process the message and file
      const { content, imageData, extractedText } = await processMessageWithFile(message, imageFile);

      // Create user message object
      const userMessage: Message = {
        role: 'user',
        content: content,
        timestamp: new Date(),
        ...(imageData && { image: imageData })
      };

      // Add user message to UI immediately
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

      console.log('User message added to chat');
      
      // Automatically send to all personas in parallel
      if (loadedPersonas.length > 0) {
        console.log('Automatically sending to all personas');
        try {
          await sendToAllPersonas(userMessage);
        } catch (error) {
          console.error('Error sending to all personas after user message:', error);
          // Don't throw here - the user message was successfully added
        }
      }
      
      return userMessage;

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendToPersona = async (personaId: string, userMessage?: Message): Promise<string> => {
    if (!sessionId) {
      toast.error('No active session');
      throw new Error('No active session');
    }

    try {
      // Find the persona
      const activePersona = loadedPersonas.find(p => p.persona_id === personaId);
      if (!activePersona) {
        throw new Error('Persona not found');
      }

      console.log('Sending conversation to persona:', activePersona.name);

      // Use provided userMessage or fall back to finding the last user message from this persona's conversation
      let messageToSend: Message | undefined = userMessage;
      
      if (!messageToSend) {
        console.log('No userMessage provided, falling back to state lookup');
        const personaMessages = personaConversations.get(personaId) || [];
        messageToSend = personaMessages.filter(m => m.role === 'user').pop();
      }

      if (!messageToSend) {
        throw new Error('No user message to send to persona');
      }

      console.log('Using message:', messageToSend.content.substring(0, 100) + '...');

      // Get this persona's individual conversation history
      const personaMessages = personaConversations.get(personaId) || [];
      const previousMessages = personaMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image: msg.image
      }));

      // Create material review context from project documents
      const materialContext = projectDocuments.length > 0 
        ? `MATERIAL FOR REVIEW - I'd like your authentic perspective on these materials I'm sharing with you:\n\n${projectDocuments.map(doc => 
            doc.content ? `"${doc.title}":\n${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}` : `"${doc.title}": [Document uploaded - visual/file content]`
          ).join('\n\n')}\n\n${messageToSend.image ? 'VISUAL MATERIAL: There is also an image I\'m sharing for you to review and give your perspective on.' : ''}\n\nPlease give me your authentic reaction and analysis from your personal perspective. There are no predetermined answers - I want YOUR genuine opinion.`
        : messageToSend.image 
          ? 'VISUAL MATERIAL FOR REVIEW: I\'m sharing an image with you. Please analyze it and give me your authentic perspective based on your values, background, and personal viewpoint.'
          : '';

      // Get persona response using the unified conversation engine with isolated conversation history
      const response = await sendMessageToPersona(
        personaId,
        messageToSend.content,
        previousMessages,
        activePersona,
        'conversation',
        materialContext,
        messageToSend.image
      );
      
      // Add persona response to this persona's individual conversation
      const personaMessage: Message & { responding_persona_id: string } = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        responding_persona_id: personaId
      };

      // Update persona's individual conversation
      setPersonaConversations(prev => {
        const updated = new Map(prev);
        const personaMessages = updated.get(personaId) || [];
        updated.set(personaId, [...personaMessages, personaMessage]);
        return updated;
      });

      // Also add to shared messages for UI display
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
      
      return response;

    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error('Failed to get persona response');
      throw error;
    }
  };

  const sendToAllPersonas = async (userMessage: Message): Promise<void> => {
    if (!sessionId) {
      toast.error('No active session');
      throw new Error('No active session');
    }

    try {
      setIsLoading(true);
      console.log('Sending message to all personas in parallel');

      // Add user message to each persona's individual conversation
      setPersonaConversations(prev => {
        const updated = new Map(prev);
        loadedPersonas.forEach(persona => {
          const personaMessages = updated.get(persona.persona_id) || [];
          updated.set(persona.persona_id, [...personaMessages, userMessage]);
        });
        return updated;
      });

      // Process all personas in parallel using the existing parallelProcessing utility
      const personaIds = loadedPersonas.map(p => p.persona_id);
      
      const sendToPersonaWrapper = async (personaId: string): Promise<string> => {
        return await sendToPersona(personaId, userMessage);
      };

      await processPersonasInParallel(
        personaIds,
        sendToPersonaWrapper,
        (progress) => {
          console.log(`Processing personas: ${progress.completed}/${progress.total}`);
        },
        3 // Max 3 concurrent requests
      );

      console.log('All personas processed successfully');
      
    } catch (error) {
      console.error('Error sending to all personas:', error);
      toast.error('Failed to send message to all personas');
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
    personaConversations,
    isLoading,
    createSession,
    sendMessage,
    sendToPersona,
    sendToAllPersonas
  };
};
