import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/persona-chat/types';
import { ResearchMessage, LoadedPersona } from '../hooks/types';

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

export const sendResearchMessage = async (
  sessionId: string,
  content: string,
  loadedPersonas: LoadedPersona[],
  targetPersonaId?: string
): Promise<{ content: string; personaId: string; personaName: string }> => {
  // Save user message first
  await saveUserMessage(sessionId, content);
  
  // Select which persona should respond
  let respondingPersona;
  if (targetPersonaId) {
    respondingPersona = loadedPersonas.find(p => p.persona_id === targetPersonaId);
  } else {
    // Default to first persona if no specific target
    respondingPersona = loadedPersonas[0];
  }
  
  if (!respondingPersona) {
    throw new Error('No persona found to respond');
  }
  
  // Generate response using the persona response service
  const { data, error } = await supabase.functions.invoke('generate-persona-response', {
    body: {
      message: content,
      personaId: respondingPersona.persona_id,
      conversationId: sessionId
    }
  });
  
  if (error) {
    console.error('Error generating persona response:', error);
    throw new Error('Failed to generate persona response');
  }
  
  const response = data.response || 'I understand your question, but I need a moment to think about it.';
  
  // Save persona response
  await savePersonaResponse(sessionId, respondingPersona.persona_id, response);
  
  return {
    content: response,
    personaId: respondingPersona.persona_id,
    personaName: respondingPersona.name
  };
};
