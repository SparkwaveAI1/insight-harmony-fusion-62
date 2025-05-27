
import { toast } from 'sonner';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';
import { ResearchMessage } from '../hooks/types';

export const generatePersonaResponse = async (
  personaId: string,
  messages: ResearchMessage[],
  loadedPersonas: Persona[]
): Promise<string> => {
  const persona = loadedPersonas.find(p => p.persona_id === personaId);
  if (!persona) {
    console.error('Persona not found:', personaId);
    toast.error('Selected persona not found');
    throw new Error('Persona not found');
  }

  console.log('Current conversation messages:', messages.length);

  // Build the complete conversation history for context
  const conversationHistory: Message[] = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
    timestamp: m.timestamp,
    image: m.image
  }));

  console.log('Conversation history being sent:', conversationHistory.map(m => `${m.role}: ${m.content.substring(0, 50)}...`));

  // Create a comprehensive prompt that includes the conversation context
  const contextualPrompt = messages.length > 0 
    ? `Based on our conversation so far, please provide your thoughts and perspective. Here's the context of what we've been discussing: ${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`
    : 'Please introduce yourself and share your thoughts on the topic we\'re discussing.';

  // Generate response using existing persona chat service with research mode
  const response = await sendMessageToPersona(
    personaId,
    contextualPrompt,
    conversationHistory,
    persona,
    'research',
    `This is a research conversation. You should respond to the ongoing conversation context, taking into account everything that has been discussed so far. Look at the conversation history to understand what has been discussed and provide your perspective as ${persona.name}.`,
    messages.length > 0 ? messages[messages.length - 1].image : undefined
  );

  console.log('Generated response:', response.substring(0, 100) + '...');
  return response;
};
