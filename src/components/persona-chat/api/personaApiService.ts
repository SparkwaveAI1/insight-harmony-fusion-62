
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '../types';
import { ChatMode } from '../ChatModeSelector';
import { ConversationOptimizer } from '../utils/conversationOptimizer';

export async function sendMessageToPersona(
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  conversationContext: string = '',
  imageData?: string
): Promise<string> {
  console.log('Using enhanced persona-quick-chat for all interactions:', { personaId, mode, messageLength: userMessage.length });

  try {
    // Always use the enhanced quick-chat function with linguistic profiles
    return await generateQuickPersonaResponse(
      personaId,
      userMessage,
      previousMessages,
      mode,
      conversationContext,
      imageData
    );

  } catch (error) {
    console.error('Error generating persona response:', error);
    return 'I apologize, but I seem to be having trouble responding right now. Could you try rephrasing your question?';
  }
}

async function generateQuickPersonaResponse(
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  mode: ChatMode,
  conversationContext: string = '',
  imageData?: string
): Promise<string> {
  console.log('Using enhanced quick-chat function with linguistic profiles');

  // Optimize conversation history for performance
  const optimizedHistory = ConversationOptimizer.optimizeHistory(previousMessages);
  console.log(`Optimized history: ${previousMessages.length} → ${optimizedHistory.length} messages`);

  const { data, error } = await supabase.functions.invoke('persona-quick-chat', {
    body: {
      personaId,
      message: userMessage,
      previousMessages: optimizedHistory,
      mode,
      conversationContext,
      imageData
    }
  });

  if (error) {
    console.error('Error calling quick-chat function:', error);
    throw new Error(`Failed to get response: ${error.message}`);
  }

  if (!data?.response) {
    console.error('No response from quick-chat function:', data);
    throw new Error('No response received from AI');
  }

  return data.response;
}

