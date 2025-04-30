
import { toast } from 'sonner';
import { Message } from '../types';

export const generatePersonaResponse = async (
  personaId: string, 
  personaRole: 'personaA' | 'personaB',
  previousMessages: Message[],
  getPersonaName: (type: 'personaA' | 'personaB') => string
) => {
  try {
    // Format previous messages for the API to maintain conversation context
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      name: msg.role === 'personaA' ? getPersonaName('personaA') : msg.role === 'personaB' ? getPersonaName('personaB') : undefined
    }));
    
    const personaName = getPersonaName(personaRole);
    
    console.log(`Generating response for ${personaName}...`);
    
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
    console.error('Error generating response:', error);
    return `Error generating response: ${error.message}`;
  }
};
