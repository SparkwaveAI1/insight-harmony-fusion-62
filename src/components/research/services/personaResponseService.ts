
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';

export const generatePersonaResponse = async (
  personaId: string,
  messageHistory: Message[],
  persona: Persona
): Promise<string> => {
  try {
    console.log('Generating response for persona:', personaId);
    console.log('Persona data:', persona);
    
    // Format message history for the API
    const formattedHistory = messageHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      image: msg.image
    }));

    // Create a natural research prompt
    const naturalResearchPrompt = "What's your take on this conversation so far?";

    // Call the Supabase Edge Function directly with proper persona data
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        persona_id: personaId,
        message: naturalResearchPrompt,
        messageHistory: formattedHistory,
        persona: persona,
        chat_mode: 'research'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error (${response.status}):`, errorText);
      throw new Error(`Failed to get persona response: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response generated successfully');
    return data.response;

  } catch (error) {
    console.error('Error generating persona response:', error);
    throw error;
  }
};

export const personaResponseService = {
  generatePersonaResponse
};
