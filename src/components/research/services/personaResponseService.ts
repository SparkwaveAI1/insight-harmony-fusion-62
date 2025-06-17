
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
    let knowledgeBaseContext = '';
    if (projectDocuments.length > 0) {
      knowledgeBaseContext = `
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

    // Format conversation for API
    const formattedHistory = conversationHistory.map(msg => {
      if (msg.role === 'user') {
        return `user: ${msg.content}`;
      } else if (msg.responding_persona_id) {
        const respondingPersona = allPersonas.find(p => p.persona_id === msg.responding_persona_id);
        const name = respondingPersona?.name || 'Unknown';
        return `${name}: ${msg.content}`;
      }
      return `assistant: ${msg.content}`;
    }).join('\n');

    console.log('Conversation history being sent:', formattedHistory.substring(0, 200) + '...');
    console.log('Sending message to persona', personaId, 'in research mode');

    // Generate knowledge boundaries and instructions
    const knowledgeBoundaries = createKnowledgeBoundaries(persona);
    const chatModeInstructions = getChatModeInstructions('research');

    // Call the edge function with knowledge base context
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        persona_id: personaId,
        message: conversationHistory[conversationHistory.length - 1]?.content || '',
        conversation_history: formattedHistory,
        mode: 'research',
        knowledge_boundaries: knowledgeBoundaries,
        chat_mode_instructions: chatModeInstructions,
        knowledge_base_context: knowledgeBaseContext
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Persona response error (${response.status}):`, errorText);
      throw new Error(`Failed to get persona response: ${response.status}`);
    }

    const data = await response.json();
    console.log('Initial response generated:', data.response.substring(0, 100) + '...');

    // Validate the response for authenticity
    console.log('Validating persona response for human speech authenticity:', persona.name);
    
    const validationResponse = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/validate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        persona_id: personaId,
        response: data.response,
        conversation_context: formattedHistory
      }),
    });

    let finalResponse = data.response;
    let validationScores = null;

    if (validationResponse.ok) {
      const validationData = await validationResponse.json();
      console.log('Validation scores:', validationData.scores);
      validationScores = validationData.scores;
      
      console.log('Human speech patterns score:', validationData.scores.humanSpeechPatterns);
      console.log('Validation feedback:', validationData.feedback);
      
      // Use improved response if validation suggests it and score is low
      if (validationData.shouldRegenerate && validationData.scores.overall < 0.6 && validationData.improvedResponse) {
        console.log('Using improved response due to low authenticity score');
        console.warn(`Low authenticity score for ${persona.name}: ${validationData.feedback}`);
        finalResponse = validationData.improvedResponse;
      }
      
      console.log('Overall authenticity score:', validationData.scores.overall);
    }

    // Save the response message to database
    const messageData = {
      conversation_id: sessionId,
      role: 'assistant' as const,
      content: finalResponse,
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

    console.log('Response saved successfully with validation scores');

    // Return the message in the expected format
    return {
      role: 'assistant',
      content: finalResponse,
      timestamp: new Date(savedMessage.created_at),
      responding_persona_id: personaId
    };

  } catch (error) {
    console.error('Error generating persona response:', error);
    toast.error('Failed to generate persona response');
    return null;
  }
};
