
import { toast } from 'sonner';
import { Message } from '../types';
import { Persona } from '@/services/persona/types';
import { supabase } from '@/integrations/supabase/client';
import { ChatMode } from '../ChatModeSelector';

export const sendMessageToPersona = async (
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  activePersona: Persona,
  chatMode: ChatMode = 'conversation',
  conversationContext: string = '',
  imageData?: string
): Promise<string> => {
  console.log(`Sending message to persona ${personaId} in ${chatMode} mode`);
  
  // Convert chat messages into a format suitable for the API
  const formattedMessages = previousMessages.map(msg => ({
    role: msg.role,
    content: msg.content,
    image: msg.image,
  }));

  try {
    // Add the new user message
    const newUserMessage: {
      role: 'user' | 'assistant';
      content: string;
      image?: string;
    } = {
      role: 'user',
      content: userMessage
    };
    
    // Add image data if present
    if (imageData) {
      newUserMessage.image = imageData;
    }
    
    formattedMessages.push(newUserMessage);

    // Call the Supabase Edge Function
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        persona_id: personaId,
        persona_role: 'assistant',
        previous_messages: formattedMessages,
        chat_mode: chatMode,
        conversation_context: conversationContext,
        has_image: !!imageData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error (${response.status}):`, errorText);
      throw new Error(`Failed to get persona response: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting persona response:', error);
    toast.error('Failed to get response from persona');
    throw error;
  }
};
