
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '../types';
import { ChatMode } from '../ChatModeSelector';
import { ConversationOptimizer } from '../utils/conversationOptimizer';
import { dbPersonaToPersona } from '@/services/persona/mappers';

export async function sendMessageToPersona(
  personaId: string,
  userMessage: string,
  previousMessages: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  conversationContext: string = '',
  imageData?: string
): Promise<string> {
  console.log('Using trait-first persona-quick-chat for authentic responses:', { personaId, mode, messageLength: userMessage.length });

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
    // Don't suppress the error - let it bubble up for proper handling
    throw error;
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
  console.log('🚀 Using trait-first chat pipeline for authentic persona responses');

  // Optimize conversation history for performance
  const optimizedHistory = ConversationOptimizer.optimizeHistory(previousMessages);
  console.log(`📊 Optimized history: ${previousMessages.length} → ${optimizedHistory.length} messages`);

  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎯 Attempt ${attempt}/${maxRetries} for persona ${personaId}`);
      
      // Use the trait-first quick chat function for authentic persona responses
      const { data, error } = await supabase.functions.invoke('v4-grok-conversation', {
        body: {
          personaId,
          message: userMessage,
          previousMessages: optimizedHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
            image: msg.image
          })),
          mode,
          conversationContext,
          imageData
        }
      });

      if (error) {
        console.error(`❌ Attempt ${attempt} error:`, error);
        
        // Smart retry logic for transient errors
        if (attempt < maxRetries && (
          error.message?.includes('timeout') || 
          error.message?.includes('canceling statement') ||
          error.message?.includes('503') ||
          error.message?.includes('502') ||
          error.message?.includes('429') // Rate limit
        )) {
          // Jittered exponential backoff
          const baseBackoff = baseDelay * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 0.3 * baseBackoff;
          const delay = Math.min(baseBackoff + jitter, 10000);
          
          console.log(`⏳ Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`Failed to get response: ${error.message}`);
      }

      if (!data?.response) {
        console.error('❌ No response from enhanced chat function:', data);
        
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          console.log(`⏳ No response received, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error('No response received from AI');
      }

      console.log(`✅ Enhanced response generated for persona ${personaId} (${data.response.length} chars)`);
      return data.response;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Progressive backoff with jitter
      const baseBackoff = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 * baseBackoff;
      const delay = Math.min(baseBackoff + jitter, 10000);
      
      console.log(`⏳ Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`❌ Failed after ${maxRetries} attempts`);
}

