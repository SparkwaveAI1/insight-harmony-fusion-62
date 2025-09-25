import { supabase } from '@/integrations/supabase/client';

export interface V4GrokConversationRequest {
  persona_id: string;
  user_message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface V4GrokConversationResponse {
  success: boolean;
  response?: string;
  traits_selected?: string[];
  persona_name?: string;
  model_used?: string;
  error?: string;
}

// Grok conversation function - same interface as OpenAI version
export async function sendV4GrokMessage(request: V4GrokConversationRequest): Promise<V4GrokConversationResponse> {
  try {
    console.log('🚀 BYPASS: Calling v4-grok-conversation directly for persona:', request.persona_id);

    // Direct call to v4-grok-conversation edge function (bypassing billing)
    const { data, error } = await supabase.functions.invoke('v4-grok-conversation', {
      body: {
        persona_id: request.persona_id,
        user_message: request.user_message,
        conversation_history: request.conversation_history || []
      }
    });

    if (error) {
      console.error('❌ Error in direct V4 Grok conversation call:', error);
      throw error;
    }

    console.log('✅ Direct V4 Grok conversation response received:', data?.persona_name);
    return data || { success: false, error: 'No response data' };

  } catch (error) {
    console.error('Error sending V4 Grok message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}