
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
  maxRetries: number = 3
): Promise<string> {
  console.log('Sending message to persona with validation:', { personaId, mode, messageLength: userMessage.length });
  console.log('Persona metadata for validation:', persona.metadata);

  let attempts = 0;
  let lastResponse = '';
  let validationFeedback = '';

  while (attempts < maxRetries) {
    attempts++;
    console.log(`Attempt ${attempts}/${maxRetries} for persona response`);

    try {
      // Generate response
      const response = await generatePersonaResponse(
        personaId,
        userMessage,
        previousMessages,
        persona,
        mode,
        conversationContext,
        imageData,
        validationFeedback // Include feedback from previous validation
      );

      lastResponse = response;

      // Validate response against persona profile
      const validation = await validatePersonaResponse(
        response,
        persona,
        conversationContext,
        userMessage
      );

      console.log(`Validation attempt ${attempts}:`, {
        overall: validation.scores.overall,
        demographicAccuracy: validation.scores.demographicAccuracy,
        shouldRegenerate: validation.shouldRegenerate,
        specificErrors: validation.specificErrors
      });

      // If validation passes (score > 0.7 AND demographic accuracy > 0.7), return the response
      if (!validation.shouldRegenerate && validation.scores.overall > 0.7 && validation.scores.demographicAccuracy > 0.7) {
        console.log('Response passed validation, returning to user');
        return response;
      }

      // If validation fails, prepare feedback for next attempt
      validationFeedback = `PREVIOUS RESPONSE FAILED VALIDATION:
Response: "${response}"
Issues: ${validation.feedback}
Specific Errors: ${validation.specificErrors.join(', ')}
Demographic Accuracy Score: ${validation.scores.demographicAccuracy}
Overall Score: ${validation.scores.overall}

CORRECTION NEEDED: Generate a new response that addresses these specific issues while staying true to the persona's exact demographic facts and personality traits. Pay special attention to demographic accuracy - all facts must be exactly correct.`;

      console.log('Response failed validation, retrying...', validation.feedback);

    } catch (error) {
      console.error(`Error in attempt ${attempts}:`, error);
      if (attempts === maxRetries) {
        throw error;
      }
      validationFeedback = `Previous attempt failed due to error: ${error.message}. Try again with a different approach.`;
    }
  }

  // If all attempts failed, return the last response with a warning
  console.warn('All validation attempts failed, returning last response');
  return lastResponse || 'I apologize, but I seem to be having trouble responding accurately right now. Could you try rephrasing your question?';
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
