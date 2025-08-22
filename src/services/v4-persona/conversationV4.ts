import { supabase } from '@/integrations/supabase/client';

export interface V4ConversationRequest {
  persona_id: string;
  user_message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface V4ConversationResponse {
  success: boolean;
  response?: string;
  traits_used?: string[];
  persona_name?: string;
  error?: string;
}

// Main V4 conversation function - used by both chat and insights
export async function sendV4Message(request: V4ConversationRequest): Promise<V4ConversationResponse> {
  try {
    console.log('Sending V4 message to persona:', request.persona_id);

    const { data, error } = await supabase.functions.invoke('v4-conversation-engine', {
      body: {
        persona_id: request.persona_id,
        user_message: request.user_message,
        conversation_history: request.conversation_history || []
      }
    });

    if (error) {
      console.error('Error in V4 conversation:', error);
      throw error;
    }

    console.log('V4 conversation response received:', data.persona_name);
    return data;

  } catch (error) {
    console.error('Error sending V4 message:', error);
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

// Enhanced conversation function that routes to appropriate engine
export async function sendMessageToAnyPersona(
  personaId: string,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<V4ConversationResponse> {
  
  if (isV4Persona(personaId)) {
    // Use V4 conversation engine
    console.log('Routing to V4 conversation engine');
    return await sendV4Message({
      persona_id: personaId,
      user_message: userMessage,
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

// For insights engine - batch process multiple personas
export async function sendMessageToMultipleV4Personas(
  personaIds: string[],
  userMessage: string,
  conversationHistories: Record<string, Array<{ role: 'user' | 'assistant'; content: string }>> = {}
): Promise<Record<string, V4ConversationResponse>> {
  
  console.log('Processing V4 insights for personas:', personaIds);
  
  const results: Record<string, V4ConversationResponse> = {};
  
  // Process personas in parallel for better performance
  const promises = personaIds.map(async (personaId) => {
    if (isV4Persona(personaId)) {
      const response = await sendV4Message({
        persona_id: personaId,
        user_message: userMessage,
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
  
  console.log('V4 insights processing complete');
  return results;
}