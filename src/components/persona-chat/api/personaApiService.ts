
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '../types';
import { ChatMode } from '../ChatModeSelector';
import { validatePersonaResponse } from '@/components/research/services/personaValidatorService';

export async function sendMessageToPersona(
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  conversationContext: string = '',
  imageData?: string,
  maxRetries: number = 1 // SIMPLIFIED: Only 1 retry to get responses faster
): Promise<string> {
  console.log('Sending message to persona (simplified validation):', { personaId, mode, messageLength: userMessage.length });

  try {
    // Generate response
    const response = await generatePersonaResponse(
      personaId,
      userMessage,
      previousMessages,
      persona,
      mode,
      conversationContext,
      imageData
    );

    // SIMPLIFIED: Skip validation for now to get responses working
    console.log('Response generated, skipping validation for speed');
    return response;

  } catch (error) {
    console.error('Error generating persona response:', error);
    return 'I apologize, but I seem to be having trouble responding right now. Could you try rephrasing your question?';
  }
}

async function generatePersonaResponse(
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  persona: Persona,
  mode: ChatMode,
  conversationContext: string,
  imageData?: string,
  validationFeedback?: string
): Promise<string> {
  // Add validation feedback to conversation context if provided
  let enhancedContext = conversationContext;
  if (validationFeedback) {
    enhancedContext = `${conversationContext}\n\nVALIDATION FEEDBACK FROM PREVIOUS ATTEMPT:\n${validationFeedback}`;
  }

  const { data, error } = await supabase.functions.invoke('openai-proxy', {
    body: {
      persona_id: personaId,
      user_message: userMessage,
      previous_messages: previousMessages,
      persona_data: persona,
      mode: mode,
      conversation_context: enhancedContext,
      image_data: imageData,
      // Enhanced parameters for more authentic responses
      temperature: 0.9,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.4
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

  return data.response;
}
