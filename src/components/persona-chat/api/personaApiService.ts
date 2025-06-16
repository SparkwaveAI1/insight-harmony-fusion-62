
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
}

export const sendMessageToPersona = async (request: SendMessageRequest): Promise<string> => {
  try {
    const { personaId, message, messageHistory, persona, file } = request;
    
    // Process file if provided using the dedicated service
    let fileData: string | undefined;
    let fileType: string | undefined;
    let fileName: string | undefined;
    
    if (file) {
      const processedFile = await FileHandlingService.processFile(file);
      fileData = processedFile.base64Data;
      fileType = processedFile.type;
      fileName = processedFile.name;
    }

    // Format message history using the dedicated service
    const formattedHistory = await MessageFormattingService.formatMessageHistory(messageHistory);

    const { data, error } = await supabase.functions.invoke('generate-persona-response', {
      body: {
        personaId,
        message,
        messageHistory: formattedHistory,
        persona,
        file_data: fileData,
        file_type: fileType,
        file_name: fileName
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
