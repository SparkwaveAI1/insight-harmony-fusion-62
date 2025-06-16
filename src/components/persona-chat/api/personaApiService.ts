
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';
import { Persona } from '@/services/persona/types';

export const sendMessageToPersona = async (
  personaId: string,
  message: string,
  messageHistory: Message[],
  persona: Persona,
  file?: File
): Promise<string> => {
  try {
    // Convert file to base64 if provided
    let fileData: string | undefined;
    let fileType: string | undefined;
    let fileName: string | undefined;
    
    if (file) {
      fileData = await convertFileToBase64(file);
      fileType = file.type;
      fileName = file.name;
    }

    // Format message history for the API - handle async operations properly
    const formattedHistory = await Promise.all(messageHistory.map(async (msg) => {
      const baseMessage = {
        role: msg.role,
        content: msg.content,
      };

      if (msg.file && msg.file instanceof File) {
        return {
          ...baseMessage,
          file_data: await convertFileToBase64(msg.file),
          file_type: msg.file.type,
          file_name: msg.file.name
        };
      }

      return baseMessage;
    }));

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

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
