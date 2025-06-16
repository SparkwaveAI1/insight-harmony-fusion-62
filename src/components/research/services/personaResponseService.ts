
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';

export const generatePersonaResponse = async (
  personaId: string,
  messageHistory: Message[],
  persona: Persona
): Promise<string> => {
  try {
    console.log('Generating response for persona:', personaId);
    
    // Create a natural research prompt
    const naturalResearchPrompt = "What's your take on this conversation so far?";

    // Generate response using the persona API
    const response = await sendMessageToPersona({
      personaId,
      message: naturalResearchPrompt,
      messageHistory,
      persona
    });

    console.log('Response generated successfully');
    return response;

  } catch (error) {
    console.error('Error generating persona response:', error);
    throw error;
  }
};

export const personaResponseService = {
  generatePersonaResponse
};
