
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '../types';
import { ChatMode } from '../ChatModeSelector';

export async function sendMessageToPersona(
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  conversationContext: string = '',
  imageData?: string
): Promise<string> {
  console.log('Sending message to persona:', { personaId, mode, messageLength: userMessage.length });

  try {
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: {
        persona_id: personaId,
        user_message: userMessage,
        previous_messages: previousMessages,
        persona_data: persona,
        mode: mode,
        conversation_context: conversationContext,
        image_data: imageData,
        // Enhanced parameters for more authentic responses
        temperature: 0.9, // Increased from default for more creativity
        top_p: 0.95, // Allow for more diverse token selection
        frequency_penalty: 0.3, // Reduce repetition
        presence_penalty: 0.4 // Encourage new topics and avoid formulaic responses
      }
    });

    if (error) {
      console.error('Error calling OpenAI proxy:', error);
      throw new Error(`Failed to get response: ${error.message}`);
    }

    if (!data?.response) {
      console.error('No response from OpenAI proxy:', data);
      throw new Error('No response received from AI');
    }

    console.log('Received response from persona:', { 
      personaId, 
      responseLength: data.response.length 
    });

    return data.response;
  } catch (error) {
    console.error('Error in sendMessageToPersona:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send message to persona');
  }
}
