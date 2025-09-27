import { supabase } from '@/integrations/supabase/client';
import { sendV4GrokMessage } from './conversationGrok';

export interface V4ConversationRequest {
  persona_id: string;
  user_message: string;
  imageData?: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface V4ConversationResponse {
  success: boolean;
  response?: string;
  traits_selected?: string[];
  persona_name?: string;
  model_used?: string;
  error?: string;
}

// Main V4 conversation function - NOW USES GROK BY DEFAULT
export async function sendV4Message(request: V4ConversationRequest): Promise<V4ConversationResponse> {
  try {
    console.log('Sending V4 message via Grok (default):', request.persona_id);

    // Use Grok as the default conversation engine
    const grokResponse = await sendV4GrokMessage({
      persona_id: request.persona_id,
      user_message: request.user_message,
      imageData: request.imageData,
      conversation_history: request.conversation_history || []
    });

    console.log('V4 conversation (Grok) response received:', grokResponse.persona_name);
    return grokResponse;

  } catch (error) {
    console.error('Error sending V4 message via Grok:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// BACKUP OPENAI FUNCTION - Keep available but not actively used
export async function sendV4MessageOpenAI(request: V4ConversationRequest): Promise<V4ConversationResponse> {
  try {
    console.log('Sending V4 message via OpenAI (backup):', request.persona_id);

    const { data, error } = await supabase.functions.invoke('v4-conversation-engine', {
      body: {
        persona_id: request.persona_id,
        user_message: request.user_message,
        conversation_history: request.conversation_history || []
      }
    });

    if (error) {
      console.error('Error in V4 OpenAI conversation:', error);
      throw error;
    }

    console.log('V4 OpenAI conversation response received:', data.persona_name);
    return {
      ...data,
      model_used: 'openai-gpt4o-mini'
    };

  } catch (error) {
    console.error('Error sending V4 OpenAI message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Utility function to detect if a persona is V4
export function isV4Persona(personaId: string): boolean {
  return personaId.startsWith('v4_');
}

// Enhanced conversation function that routes to appropriate engine (NOW DEFAULTS TO GROK)
export async function sendMessageToAnyPersona(
  personaId: string,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<V4ConversationResponse> {
  
  if (isV4Persona(personaId)) {
    // Use Grok conversation engine as default
    console.log('Routing to V4 Grok conversation engine (default)');
    return await sendV4Message({
      persona_id: personaId,
      user_message: userMessage,
      imageData: undefined, // No image support for this function
      conversation_history: conversationHistory
    });
  } else {
    // TODO: Route to existing V3 system (for now, return error)
    console.log('V3 personas not yet supported in unified service');
    return {
      success: false,
      error: 'V3 personas not yet supported. Please use V4 personas.'
    };
  }
}

// For insights engine - batch process multiple personas WITH GROK
export async function sendMessageToMultipleV4Personas(
  personaIds: string[],
  userMessage: string,
  conversationHistories: Record<string, Array<{ role: 'user' | 'assistant'; content: string }>> = {}
): Promise<Record<string, V4ConversationResponse>> {
  
  console.log('Processing V4 insights with Grok for personas:', personaIds);
  
  const results: Record<string, V4ConversationResponse> = {};
  
  // Process personas in parallel using Grok
  const promises = personaIds.map(async (personaId) => {
    if (isV4Persona(personaId)) {
      const response = await sendV4Message({
        persona_id: personaId,
        user_message: userMessage,
        imageData: undefined, // No image support for batch processing
        conversation_history: conversationHistories[personaId] || []
      });
      results[personaId] = response;
    } else {
      results[personaId] = {
        success: false,
        error: 'Only V4 personas supported'
      };
    }
  });
  
  await Promise.all(promises);
  
  console.log('V4 insights processing complete with Grok');
  return results;
}