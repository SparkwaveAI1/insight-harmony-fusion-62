
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';
import { ResearchMessage } from '../hooks/types';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';
import { savePersonaResponse, createPersonaMessage } from './messageService';

export const generatePersonaResponse = async (
  personaId: string,
  sessionId: string,
  currentMessages: ResearchMessage[],
  currentPersonas: Persona[]
): Promise<ResearchMessage | null> => {
  if (!sessionId) {
    console.error('No session ID available');
    return null;
  }

  try {
    console.log('Generating response for persona:', personaId);
    
    const persona = currentPersonas.find(p => p.persona_id === personaId);
    if (!persona) {
      console.error('Persona not found:', personaId);
      toast.error('Selected persona not found');
      return null;
    }

    console.log('Current conversation messages:', currentMessages.length);

    // Build the complete conversation history for context
    const conversationHistory: Message[] = currentMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.timestamp,
      image: m.image
    }));

    console.log('Conversation history being sent:', conversationHistory.map(m => `${m.role}: ${m.content.substring(0, 50)}...`));

    // Create a comprehensive prompt that includes the conversation context
    const contextualPrompt = currentMessages.length > 0 
      ? `Based on our conversation so far, please provide your thoughts and perspective. Here's the context of what we've been discussing: ${currentMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`
      : 'Please introduce yourself and share your thoughts on the topic we\'re discussing.';

    // Generate response using existing persona chat service with research mode
    const response = await sendMessageToPersona(
      personaId,
      contextualPrompt,
      conversationHistory,
      persona,
      'research',
      `This is a research conversation. You should respond to the ongoing conversation context, taking into account everything that has been discussed so far. Look at the conversation history to understand what has been discussed and provide your perspective as ${persona.name}.`,
      currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].image : undefined
    );

    console.log('Generated response:', response.substring(0, 100) + '...');

    // Create persona message
    const assistantMessage = createPersonaMessage(response, personaId);

    // Save to database
    await savePersonaResponse(sessionId, personaId, response);

    console.log('Response saved successfully');

    return assistantMessage;

  } catch (error) {
    console.error('Error generating persona response:', error);
    toast.error(`Failed to generate response from ${currentPersonas.find(p => p.persona_id === personaId)?.name || 'persona'}`);
    return null;
  }
};
