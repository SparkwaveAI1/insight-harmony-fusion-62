
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { ResearchMessage } from '../hooks/types';
import { KnowledgeBaseDocument } from '@/services/collections';
import { createKnowledgeBoundaries, getChatModeInstructions } from '@/components/persona-chat/utils/personaInstructionsUtils';

export const generatePersonaResponse = async (
  personaId: string,
  sessionId: string,
  conversationHistory: ResearchMessage[],
  allPersonas: Persona[],
  projectDocuments: KnowledgeBaseDocument[] = []
): Promise<ResearchMessage | null> => {
  console.log('Generating response for persona:', personaId);
  console.log('Current conversation messages:', conversationHistory.length);
  console.log('Available project documents:', projectDocuments.length);
  
  try {
    const persona = allPersonas.find(p => p.persona_id === personaId);
    if (!persona) {
      console.error('Persona not found:', personaId);
      toast.error('Persona not found');
      return null;
    }

    // Create knowledge base context if documents are available
    let conversationContext = '';
    if (projectDocuments.length > 0) {
      conversationContext = `
PROJECT KNOWLEDGE BASE CONTEXT:
You have access to the following project documents and should reference them when relevant:

${projectDocuments.map(doc => `
DOCUMENT: ${doc.title}
${doc.content ? `CONTENT: ${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}` : ''}
${doc.file_type ? `FILE TYPE: ${doc.file_type}` : ''}
---
`).join('\n')}

When answering questions, you can reference information from these documents if it's relevant to your expertise and the conversation. Always mention which document you're referencing when you use information from the knowledge base.
`;
    }

    // Format previous messages for the conversation engine
    const previousMessages = conversationHistory.map(msg => {
      const baseMessage: any = {
        role: msg.role,
        content: msg.content
      };
      
      // Add image if present
      if (msg.image) {
        baseMessage.image = msg.image;
      }
      
      // Add persona name for assistant messages
      if (msg.role === 'assistant' && msg.responding_persona_id) {
        const respondingPersona = allPersonas.find(p => p.persona_id === msg.responding_persona_id);
        if (respondingPersona) {
          baseMessage.name = respondingPersona.name;
        }
      }
      
      return baseMessage;
    });

    console.log('Formatted conversation history:', previousMessages.length, 'messages');
    console.log('Sending message to persona', personaId, 'in research mode');

    // Generate knowledge boundaries and instructions
    const knowledgeBoundaries = createKnowledgeBoundaries(persona);
    const personalityInstructions = `
RESEARCH SESSION CONTEXT:
- You are participating in a research session with multiple personas
- Other participants may have different perspectives and expertise
- Express your authentic views and opinions without being diplomatic
- Disagree when you genuinely disagree - this is research, not customer service
- Share detailed insights when you're engaged with a topic
- React authentically based on your personality and values
- DO NOT ask questions back to other participants or the moderator
- Simply share YOUR perspective and end your responses with your thoughts
`;

    // Check if the last message has an image
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const hasImage = lastMessage?.image ? true : false;

    // Call the generate-persona-response edge function with full conversation engine
    const response = await supabase.functions.invoke('generate-persona-response', {
      body: {
        persona_id: personaId,
        persona_role: 'research_participant',
        previous_messages: previousMessages,
        knowledge_boundaries: knowledgeBoundaries,
        personality_instructions: personalityInstructions,
        chat_mode: 'research',
        conversation_context: conversationContext,
        has_image: hasImage
      }
    });

    if (response.error) {
      console.error('Edge function error:', response.error);
      throw new Error(`Failed to get persona response: ${response.error.message}`);
    }

    const { response: generatedResponse } = response.data;
    console.log('Generated response:', generatedResponse.substring(0, 100) + '...');

    // Save the response message to database
    const messageData = {
      conversation_id: sessionId,
      role: 'assistant' as const,
      content: generatedResponse,
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

    console.log('Response saved successfully');

    // Return the message in the expected format
    return {
      role: 'assistant',
      content: generatedResponse,
      timestamp: new Date(savedMessage.created_at),
      responding_persona_id: personaId
    };

  } catch (error) {
    console.error('Error generating persona response:', error);
    toast.error('Failed to generate persona response');
    return null;
  }
};
