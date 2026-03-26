import { supabase } from '@/integrations/supabase/client';

export interface V4GrokConversationRequest {
  persona_id: string;
  user_message: string;
  imageData?: string;
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
    console.log('🚀 CALLING V4 GROK:', request.persona_id);
    console.log('🚀 GROK REQUEST PAYLOAD:', JSON.stringify(request, null, 2));


    const { data, error } = await supabase.functions.invoke('v4-grok-conversation-clean', {
      body: {
        persona_id: request.persona_id,
        user_message: request.user_message,
        imageData: request.imageData,
        conversation_history: request.conversation_history || []
      }
    });

    console.log('🔍 SUPABASE INVOKE RESULT - DATA:', JSON.stringify(data, null, 2));
    console.log('🔍 SUPABASE INVOKE RESULT - ERROR:', JSON.stringify(error, null, 2));

    if (error) {
      console.error('❌ Error in V4 Grok conversation:', error);
      throw error;
    }

    console.log('✅ V4 Grok conversation response received:', data?.persona_name);
    return data;

  } catch (error) {
    console.error('Error sending V4 Grok message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}