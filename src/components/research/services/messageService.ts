
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/persona-chat/types';
import { ResearchMessage } from '../hooks/types';

export const saveUserMessage = async (
  sessionId: string,
  content: string
): Promise<void> => {
  const { error: dbError } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: sessionId,
      role: 'user',
      content,
      persona_id: null,
      responding_persona_id: null
    });

  if (dbError) {
    console.error('Error saving message to database:', dbError);
  } else {
    console.log('Message saved to database successfully');
  }
};

export const savePersonaResponse = async (
  sessionId: string,
  personaId: string,
  response: string
): Promise<void> => {
  await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: sessionId,
      role: 'assistant',
      content: response,
      persona_id: personaId,
      responding_persona_id: personaId
    });
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const createUserMessage = async (
  content: string,
  imageFile?: File | null
): Promise<ResearchMessage> => {
  return {
    role: 'user',
    content,
    timestamp: new Date(),
    image: imageFile ? await convertFileToBase64(imageFile) : undefined
  };
};

export const createPersonaMessage = (
  content: string,
  personaId: string
): ResearchMessage => {
  return {
    role: 'assistant',
    content,
    timestamp: new Date(),
    responding_persona_id: personaId
  };
};

export const sendUserMessage = async (
  sessionId: string,
  content: string,
  imageFile?: File | null
): Promise<ResearchMessage> => {
  if (!sessionId || !content.trim()) {
    throw new Error('Missing sessionId or content');
  }

  console.log('Sending message:', content);

  // Create user message
  const userMessage = await createUserMessage(content, imageFile);

  // Save user message to database
  await saveUserMessage(sessionId, content);

  return userMessage;
};
