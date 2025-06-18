
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { getProjectById, getProjectDocuments } from '@/services/collections';
import { processMessageWithFile, sendResearchMessage, ResearchMessage } from '../services/messageService';

export interface UseResearchSessionReturn {
  sessionId: string | null;
  loadedPersonas: Persona[];
  projectDocuments: any[];
  messages: (ResearchMessage & { responding_persona_id?: string })[];
  isLoading: boolean;
  createSession: (personaIds: string[], projectId?: string) => Promise<void>;
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  selectPersonaResponder: (personaId: string) => void;
}

export const useResearchSession = (projectId?: string): UseResearchSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<(ResearchMessage & { responding_persona_id?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonaResponder, setSelectedPersonaResponder] = useState<string | null>(null);

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

  const createSession = async (personaIds: string[], selectedProjectId?: string) => {
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

      // Load personas with proper type mapping
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .in('persona_id', personaIds);

      if (personasError) throw personasError;

      // Map database personas to Persona type
      const mappedPersonas: Persona[] = (personasData || []).map(p => ({
        ...p,
        persona_context: '', // Add default value
        persona_type: 'standard' // Add default value
      }));

      setLoadedPersonas(mappedPersonas);
      setMessages([]);
      
      // Set first persona as default responder
      if (mappedPersonas.length > 0) {
        setSelectedPersonaResponder(mappedPersonas[0].persona_id);
      }

      toast.success('Research session started successfully');
    } catch (error) {
      console.error('Error creating research session:', error);
      toast.error('Failed to create research session');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string, imageFile?: File | null) => {
    if (!sessionId || !selectedPersonaResponder) {
      toast.error('No active session or selected persona');
      return;
    }

    try {
      setIsLoading(true);

      // Process the message and file
      const { content, imageData, extractedText } = await processMessageWithFile(message, imageFile);

      // Add user message to UI immediately
      const userMessage: ResearchMessage = {
        role: 'user',
        content: content,
        timestamp: new Date(),
        ...(imageData && { image: imageData }),
        ...(extractedText && { extracted_text: extractedText })
      };

      setMessages(prev => [...prev, userMessage]);

      // Store message in database using existing conversation_messages table
      await sendResearchMessage(sessionId, content, selectedPersonaResponder, imageData, extractedText);

      // Get persona response
      await getPersonaResponse(content, selectedPersonaResponder, imageData);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaResponse = async (userMessage: string, personaId: string, imageData?: string) => {
    try {
      // Format previous messages for the API
      const previousMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image: msg.image
      }));

      // Call the persona response API
      const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
        },
        body: JSON.stringify({
          persona_id: personaId,
          persona_role: 'assistant',
          previous_messages: [...previousMessages, {
            role: 'user',
            content: userMessage,
            ...(imageData && { image: imageData })
          }],
          chat_mode: 'research',
          conversation_context: projectDocuments.length > 0 ? 
            `Available knowledge base documents: ${projectDocuments.map(d => d.title).join(', ')}` : '',
          has_image: !!imageData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get persona response: ${response.status}`);
      }

      const data = await response.json();
      
      // Add persona response to messages
      const personaMessage: ResearchMessage & { responding_persona_id: string } = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        responding_persona_id: personaId
      };

      setMessages(prev => [...prev, personaMessage]);

      // Store persona response in database using existing conversation_messages table
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'assistant',
          content: data.response,
          persona_id: personaId,
          responding_persona_id: personaId
        });

    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error('Failed to get persona response');
    }
  };

  const selectPersonaResponder = useCallback((personaId: string) => {
    setSelectedPersonaResponder(personaId);
  }, []);

  return {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    selectPersonaResponder
  };
};
