
/**
 * Service for handling API calls to the persona service
 */
import { toast } from 'sonner';
import { Message } from '../types';
import { Persona } from '@/services/persona/types';
import { createKnowledgeBoundaries } from '../utils/personaInstructionsUtils';

/**
 * Sends a message to the persona API and retrieves the response
 * @param personaId The ID of the persona to send the message to
 * @param inputMessage The user's message
 * @param previousMessages Previous messages in the conversation
 * @param activePersona The active persona object
 * @returns The persona's response text
 */
export const sendMessageToPersona = async (
  personaId: string,
  inputMessage: string,
  previousMessages: Message[],
  activePersona: Persona | null
): Promise<string> => {
  console.log("Sending message to persona:", inputMessage);
  console.log("Persona ID:", personaId);
  
  const formattedPreviousMessages = previousMessages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
  
  console.log("Previous messages:", formattedPreviousMessages);
  
  // Create knowledge boundaries based on the persona's traits and metadata
  const knowledgeBoundaries = activePersona ? createKnowledgeBoundaries(activePersona) : "";

  const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
    },
    body: JSON.stringify({
      persona_id: personaId,
      previous_messages: [
        ...formattedPreviousMessages,
        { role: 'user', content: inputMessage }
      ],
      knowledge_boundaries: knowledgeBoundaries,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Edge function error (${response.status}):`, errorText);
    throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Received response from persona:", data.response);
  
  return data.response;
};
