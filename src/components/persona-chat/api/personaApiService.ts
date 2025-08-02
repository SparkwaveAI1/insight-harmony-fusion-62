
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

  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} for persona ${personaId}`);
      
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
        console.error(`Attempt ${attempt} error:`, error);
        
        // If it's a timeout or server error, retry
        if (attempt < maxRetries && (
          error.message?.includes('timeout') || 
          error.message?.includes('canceling statement') ||
          error.message?.includes('503') ||
          error.message?.includes('502')
        )) {
          const delay = baseDelay * attempt;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`Failed to get response: ${error.message}`);
      }

      if (!data?.response) {
        console.error('No response from quick-chat function:', data);
        
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          console.log(`No response received, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error('No response received from AI');
      }

      console.log(`Successfully got response for persona ${personaId} on attempt ${attempt}`);
      return data.response;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * attempt;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts`);
}

