
import { Message } from '../types';
import { toast } from 'sonner';

export const generatePersonaResponse = async (
  personaId: string,
  personaRole: 'personaA' | 'personaB',
  previousMessages: Message[],
  getPersonaName: (type: 'personaA' | 'personaB') => string
): Promise<string> => {
  console.log(`Generating response for persona ${personaId} (${personaRole})`);
  
  try {
    // Convert chat messages into a format suitable for the API
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      name: msg.role !== 'user' ? getPersonaName(msg.role as 'personaA' | 'personaB') : undefined
    }));
    
    console.log("Formatted messages for persona API:", JSON.stringify(formattedMessages));
    
    // Call the Supabase Edge Function for persona response
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        persona_id: personaId,
        persona_role: personaRole,
        previous_messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error (${response.status}):`, errorText);
      throw new Error(`Failed to get persona response: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received response from persona ${personaId}: ${data.response.substring(0, 20)}...`);
    
    return data.response;
  } catch (error) {
    console.error('Error getting persona response:', error);
    toast.error('Failed to get response from persona');
    throw error;
  }
};
