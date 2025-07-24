
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { ResearchMessage } from '../hooks/types';
import { KnowledgeBaseDocument } from '@/services/collections';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';

export const generatePersonaResponse = async (
  personaId: string,
  sessionId: string,
  conversationHistory: ResearchMessage[],
  allPersonas: Persona[],
  projectDocuments: KnowledgeBaseDocument[] = []
): Promise<ResearchMessage | null> => {
  console.log('Generating validated response for persona:', personaId);
  console.log('Current conversation messages:', conversationHistory.length);
  console.log('Available project documents:', projectDocuments.length);
  
  try {
    const persona = allPersonas.find(p => p.persona_id === personaId);
    if (!persona) {
      console.error('Persona not found:', personaId);
      toast.error('Persona not found');
      return null;
    }

    // Create comprehensive knowledge base context with full document contents
    let conversationContext = '';
    if (projectDocuments.length > 0) {
      conversationContext = `
PROJECT KNOWLEDGE BASE CONTEXT:
You have access to the following project documents. Use this information to inform your responses:

${projectDocuments.map(doc => `
DOCUMENT: ${doc.title}
${doc.content ? `CONTENT: ${doc.content}` : ''}
${doc.file_type ? `FILE TYPE: ${doc.file_type}` : ''}
---
`).join('\n')}

IMPORTANT: Reference these documents when relevant to the conversation. When you use information from the documents, mention which document you're referencing. These documents contain the full context for this research project.
`;

      console.log('Created knowledge base context with', projectDocuments.length, 'documents');
    }

    // Convert research messages to persona chat format
    const chatMessages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      image: msg.image
    }));

    // Get the last message to extract user input and image
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const userMessage = lastMessage?.role === 'user' ? lastMessage.content : '';
    const imageData = lastMessage?.image;

    console.log('Using validated conversation engine for research response with knowledge base context');

    // Use the same conversation engine as individual persona chat
    const response = await sendMessageToPersona(
      personaId,
      userMessage,
      chatMessages,
      persona,
      'conversation', // Use conversation mode everywhere
      conversationContext // Include knowledge base context
    );

    // Save the response message to database
    const messageData = {
      conversation_id: sessionId,
      role: 'assistant' as const,
      content: response,
      responding_persona_id: personaId
    };

    const { data: savedMessage, error: saveError } = await supabase
      .from('conversation_messages')
      .insert(messageData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving response message:', saveError);
      toast.error('Failed to save response message');
      return null;
    }

    console.log('Validated response saved successfully with knowledge base context');

    // Return the message in the expected format
    return {
      role: 'assistant',
      content: response,
      timestamp: new Date(savedMessage.created_at),
      responding_persona_id: personaId
    };

  } catch (error) {
    console.error('Error generating validated persona response:', error);
    toast.error('Failed to generate persona response');
    return null;
  }
};
