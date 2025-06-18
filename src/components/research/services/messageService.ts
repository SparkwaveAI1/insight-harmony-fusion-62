
import { supabase } from '@/integrations/supabase/client';
import { extractTextFromFile } from '@/services/collections/textExtractionService';

export interface ResearchMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responding_persona_id?: string;
  image?: string;
  extracted_text?: string;
}

export const processMessageWithFile = async (
  message: string,
  file: File | null
): Promise<{ content: string; imageData?: string; extractedText?: string }> => {
  if (!file) {
    return { content: message };
  }

  // Handle images - convert to base64 for vision processing
  if (file.type.startsWith('image/')) {
    try {
      const base64 = await fileToBase64(file);
      return {
        content: message || `I've shared an image (${file.name}) for you to look at.`,
        imageData: `data:${file.type};base64,${base64}`
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return { content: message };
    }
  }

  // Handle documents - extract text content
  try {
    const extractedText = await extractTextFromFile(file);
    
    if (extractedText) {
      const enhancedMessage = message 
        ? `${message}\n\n--- Content from ${file.name} ---\n${extractedText}`
        : `I've shared a document (${file.name}) with the following content:\n\n${extractedText}`;
      
      return {
        content: enhancedMessage,
        extractedText
      };
    } else {
      // If extraction failed, just mention the file was uploaded
      const fallbackMessage = message 
        ? `${message}\n\n(Note: I tried to share ${file.name} but the content couldn't be extracted)`
        : `I uploaded ${file.name} but the content couldn't be extracted automatically.`;
      
      return { content: fallbackMessage };
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    const errorMessage = message 
      ? `${message}\n\n(Note: I tried to share ${file.name} but there was an error processing it)`
      : `I uploaded ${file.name} but there was an error processing it.`;
    
    return { content: errorMessage };
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
