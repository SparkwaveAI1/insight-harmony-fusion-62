
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
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
  selectPersonaResponder: (personaId: string) => Promise<void>;
}

export const useResearchSession = (projectId?: string): UseResearchSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<(Message & { responding_persona_id?: string })[]>([]);
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

  const createSession = async (personaIds: string[], selectedProjectId?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Use provided projectId or the one from props
      const useProjectId = selectedProjectId || projectId;
      
      if (!useProjectId) {
        throw new Error('Project ID is required');
        return false;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
        return false;
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

      // Load personas using the persona service to get proper types
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .in('persona_id', personaIds);

      if (personasError) throw personasError;

      // Convert database personas to proper Persona type
      const mappedPersonas: Persona[] = (personasData || []).map(p => ({
        persona_id: p.persona_id,
        name: p.name,
        metadata: (p.metadata as any) || {},
        trait_profile: (p.trait_profile as any) || {},
        linguistic_profile: (p.linguistic_profile as any) || {},
        behavioral_modulation: (p.behavioral_modulation as any) || {},
        simulation_directives: (p.simulation_directives as any) || {},
        interview_sections: (p.interview_sections as any) || {},
        preinterview_tags: (p.preinterview_tags as any) || {},
        emotional_triggers: (p.emotional_triggers as any) || {},
        creation_date: p.creation_date,
        prompt: p.prompt || '',
        profile_image_url: p.profile_image_url || '',
        is_public: p.is_public || false,
        user_id: p.user_id || '',
        persona_context: '',
        persona_type: 'standard'
      }));

      setLoadedPersonas(mappedPersonas);
      setMessages([]);
      
      // Set first persona as default responder
      if (mappedPersonas.length > 0) {
        setSelectedPersonaResponder(mappedPersonas[0].persona_id);
      }

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

  const sendMessage = async (message: string, imageFile?: File | null): Promise<void> => {
    if (!sessionId || !selectedPersonaResponder) {
      toast.error('No active session or selected persona');
      return;
    }

    try {
      setIsLoading(true);

      // Process the message and file using the same logic as persona chat
      const { content, imageData, extractedText } = await processMessageWithFile(message, imageFile);

      // Add user message to UI immediately
      const userMessage: Message = {
        role: 'user',
        content: content,
        timestamp: new Date(),
        ...(imageData && { image: imageData })
      };

      setMessages(prev => [...prev, userMessage]);

      // Store message in database using existing conversation_messages table
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: sessionId,
          role: 'user',
          content: content,
          persona_id: selectedPersonaResponder,
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

      // Get persona response using the same API as persona chat
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
      // Find the persona
      const activePersona = loadedPersonas.find(p => p.persona_id === personaId);
      if (!activePersona) {
        throw new Error('Persona not found');
      }

      // Format previous messages for the API (same format as persona chat)
      const previousMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image: msg.image
      }));

      // Use the same persona API service as regular chat
      const response = await sendMessageToPersona(
        personaId,
        userMessage,
        previousMessages,
        activePersona,
        'research', // Use research mode
        projectDocuments.length > 0 ? 
          `Available knowledge base documents: ${projectDocuments.map(d => d.title).join(', ')}` : '',
        imageData
      );
      
      // Add persona response to messages
      const personaMessage: Message & { responding_persona_id: string } = {
        role: 'assistant',
        content: response,
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
          content: response,
          persona_id: personaId,
          responding_persona_id: personaId
        });

    } catch (error) {
      console.error('Error getting persona response:', error);
      toast.error('Failed to get persona response');
    }
  };

  const selectPersonaResponder = useCallback(async (personaId: string): Promise<void> => {
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
