
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';
import { Persona } from '@/services/persona/types';
import { FileHandlingService } from '@/services/fileHandlingService';
import { MessageFormattingService } from '@/services/messageFormattingService';

export interface SendMessageRequest {
  personaId: string;
  message: string;
  messageHistory: Message[];
  persona: Persona;
  file?: File;
  chatMode?: string;
}

export const sendMessageToPersona = async (request: SendMessageRequest): Promise<string> => {
  try {
    const { personaId, message, messageHistory, persona, file, chatMode = 'conversation' } = request;
    
    // Process file if provided using the dedicated service
    let hasImage = false;
    
    if (file) {
      const processedFile = await FileHandlingService.processFile(file);
      hasImage = true;
      
      // Add the file to the message history for the API call
      const messageWithFile = {
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
        image: processedFile.base64Data
      };
      
      messageHistory = [...messageHistory, messageWithFile];
    }

    // Format message history using the dedicated service
    const formattedHistory = await MessageFormattingService.formatMessageHistory(messageHistory);

    const { data, error } = await supabase.functions.invoke('generate-persona-response', {
      body: {
        persona_id: personaId,
        previous_messages: formattedHistory,
        chat_mode: chatMode,
        has_image: hasImage
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.response) {
      throw new Error('No response received from persona');
    }

    return data.response;
  } catch (error) {
    console.error('Error in sendMessageToPersona:', error);
    throw error;
  }
};
