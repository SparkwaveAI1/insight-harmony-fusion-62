
import { toast } from 'sonner';
import { Message } from '../types';
import { handleApiError } from '@/services/utils/apiUtils';

// Configuration for retries
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const generatePersonaResponse = async (
  personaId: string, 
  personaRole: 'personaA' | 'personaB',
  previousMessages: Message[],
  getPersonaName: (type: 'personaA' | 'personaB') => string
) => {
  let retries = 0;
  
  // Retry loop
  while (retries <= MAX_RETRIES) {
    try {
      // Format previous messages for the API to maintain conversation context
      const formattedMessages = previousMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        name: msg.role === 'personaA' ? getPersonaName('personaA') : msg.role === 'personaB' ? getPersonaName('personaB') : undefined
      }));
      
      const personaName = getPersonaName(personaRole);
      
      console.log(`Generating response for ${personaName}... (attempt ${retries + 1})`);
      
      // Call the Supabase edge function to generate a response
      const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
        },
        body: JSON.stringify({
          message: previousMessages.length > 0 ? previousMessages[previousMessages.length - 1].content : "Hello",
          persona: { name: personaName },
          previousMessages: formattedMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.response;
      
    } catch (error) {
      console.error(`Error generating response (attempt ${retries + 1}):`, error);
      
      // If we've exhausted all retries, notify the user and return a fallback response
      if (retries === MAX_RETRIES) {
        handleApiError(error, 'Persona Response Service');
        return `I'm sorry, I'm having trouble responding right now. Could we try again in a moment?`;
      }
      
      // Log retry attempt and wait before retrying
      console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      
      // Increase delay with each retry (exponential backoff)
      retries++;
    }
  }
  
  // This should never be reached due to the return in the final retry,
  // but TypeScript expects a return value from all code paths
  return "I apologize, but I'm unable to respond at the moment.";
};
