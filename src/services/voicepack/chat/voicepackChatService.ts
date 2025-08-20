import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';
import { ChatMode } from '@/components/persona-chat/ChatModeSelector';
import { sendMessageToPersona as sendMessageToPersonaOriginal } from '@/components/persona-chat/api/personaApiService';

export interface VoicepackChatOptions {
  useVoicepack?: boolean;
  state?: Record<string, any>;
  conversationContext?: string;
}

/**
 * Enhanced persona chat service with voicepack integration
 */
export async function sendMessageToPersonaWithVoicepack(
  personaId: string,
  userMessage: string,
  conversationHistory: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  additionalContext: string = '',
  imageData: string | null = null,
  options: VoicepackChatOptions = {}
): Promise<{ response: string; telemetry?: Record<string, any> }> {
  
  const { useVoicepack = true, state = {}, conversationContext = '' } = options;
  
  console.log('🎭 Voicepack Chat: Starting production voicepack flow');
  console.log('Settings:', { useVoicepack, personaId, mode });

  try {
    if (useVoicepack) {
      return await productionVoicepackChat(
        personaId, 
        userMessage, 
        conversationHistory, 
        additionalContext,
        imageData,
        conversationContext
      );
    } else {
      // Fallback to traditional persona chat
      const response = await sendMessageToPersonaOriginal(
        personaId,
        userMessage,
        conversationHistory,
        persona,
        mode,
        additionalContext,
        imageData
      );
      return { response };
    }
  } catch (error) {
    console.error('❌ Voicepack chat failed:', error);
    // Fallback to traditional chat on error
    console.log('🔄 Falling back to traditional persona chat');
    const response = await sendMessageToPersonaOriginal(
      personaId,
      userMessage,
      conversationHistory,
      persona,
      mode,
      additionalContext,
      imageData
    );
    return { response };
  }
}

/**
 * Production authentic persona chat using the new persona-authentic-chat edge function
 */
async function productionVoicepackChat(
  personaId: string,
  userMessage: string,
  conversationHistory: Message[],
  additionalContext: string = '',
  imageData: string | null = null,
  conversationContext: string = ''
): Promise<{ response: string; telemetry?: Record<string, any> }> {
  
  const startTime = Date.now();
  
  console.log('🎭 Using authentic persona pipeline via persona-authentic-chat');
  
  // Combine additional context and conversation context
  const combinedContext = [additionalContext, conversationContext].filter(Boolean).join('\n\n');
  
  // Call the new authentic edge function that handles comprehensive trait scanning
  const { data, error } = await supabase.functions.invoke('persona-authentic-chat', {
    body: {
      personaId: personaId,
      message: userMessage,
      previousMessages: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      conversationContext: combinedContext,
      imageData: imageData
    }
  });
  
  if (error) {
    console.error('❌ Authentic persona call failed:', error);
    throw new Error(`Authentic persona call failed: ${error.message}`);
  }
  
  if (!data?.response) {
    throw new Error('No response from authentic persona pipeline');
  }
  
  const telemetry = {
    latency_ms: Date.now() - startTime,
    used_authentic_pipeline: true,
    traits_analyzed: data.metadata?.traits_analyzed || 0,
    emotional_triggers: data.metadata?.emotional_triggers || 0,
    knowledge_domains: data.metadata?.knowledge_domains || 0,
    ...(data.metadata || {})
  };
  
  console.log('✅ Authentic persona chat complete. Latency:', telemetry.latency_ms, 'ms');
  console.log('📊 Trait analysis:', {
    traits_analyzed: telemetry.traits_analyzed,
    emotional_triggers: telemetry.emotional_triggers,
    knowledge_domains: telemetry.knowledge_domains
  });
  
  return {
    response: data.response,
    telemetry
  };
}

/**
 * Traditional persona chat (fallback) - wrapper for the original function
 */
export async function sendMessageToPersona(
  personaId: string,
  message: string,
  conversationHistory: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  additionalContext: string = '',
  imageData: string | null = null
): Promise<string> {
  console.log('📞 Traditional persona chat API call');
  console.log('Persona:', persona.name);
  console.log('Mode:', mode);
  console.log('Message preview:', message.substring(0, 100));
  console.log('Conversation history length:', conversationHistory.length);
  console.log('Has image:', !!imageData);
  console.log('Additional context length:', additionalContext.length);

  try {
    // Delegate to the original implementation
    return await sendMessageToPersonaOriginal(
      personaId,
      message,
      conversationHistory,
      persona,
      mode,
      additionalContext,
      imageData
    );

  } catch (error) {
    console.error('❌ Traditional persona chat failed:', error);
    throw error;
  }
}