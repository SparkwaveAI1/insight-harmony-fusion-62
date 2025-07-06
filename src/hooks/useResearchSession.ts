
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { KnowledgeBaseDocument } from '@/services/collections';
import { mapDbPersonaToPersona } from '@/services/persona/mappers';

interface ResearchMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  responding_persona_id?: string;
  image?: string;
}

export const useResearchSession = (projectId?: string) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadedPersonas, setLoadedPersonas] = useState<Persona[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load project documents if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProjectDocuments();
    }
  }, [projectId]);

  const loadProjectDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('knowledge_base_documents')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      setProjectDocuments(data || []);
    } catch (error) {
      console.error('Error loading project documents:', error);
    }
  };

  const createSession = async (selectedPersonaIds: string[]) => {
    setIsLoading(true);
    try {
      // Load selected personas
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .in('persona_id', selectedPersonaIds);

      if (error) throw error;

      const personas = data.map(mapDbPersonaToPersona);
      setLoadedPersonas(personas);
      
      // Generate session ID
      const newSessionId = `research-${Date.now()}`;
      setSessionId(newSessionId);

      toast({
        title: "Research Session Started",
        description: `Loaded ${personas.length} persona(s) for research`,
      });

    } catch (error) {
      console.error('Error creating research session:', error);
      toast({
        title: "Error",
        description: "Failed to create research session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, imageFile?: File | null) => {
    if (!content.trim()) return;

    const userMessage: ResearchMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
      image: imageFile ? URL.createObjectURL(imageFile) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
  };

  const sendToPersona = async (personaId: string) => {
    const persona = loadedPersonas.find(p => p.persona_id === personaId);
    if (!persona || messages.length === 0) return;

    setIsLoading(true);
    try {
      // Get the conversation context
      const conversationContext = messages.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');

      // Call the persona response function
      const { data, error } = await supabase.functions.invoke('generate-persona-response', {
        body: {
          persona,
          message: conversationContext,
          projectDocuments: projectDocuments.length > 0 ? projectDocuments : undefined
        }
      });

      if (error) throw error;

      const assistantMessage: ResearchMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        responding_persona_id: personaId
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error getting persona response:', error);
      toast({
        title: "Error",
        description: "Failed to get persona response",
        variant: "destructive",
      });
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
