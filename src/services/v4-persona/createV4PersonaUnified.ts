import { supabase } from '@/integrations/supabase/client';

export interface CreateV4PersonaUnifiedRequest {
  user_description: string;
  user_id: string;
}

export interface CreateV4PersonaUnifiedResponse {
  success: boolean;
  persona_id?: string;
  persona_name?: string;
  stage?: string;
  background?: string;
  character_description?: string;
  physical_description?: string;
  message?: string;
  error?: string;
}

export async function createV4PersonaUnified(request: CreateV4PersonaUnifiedRequest): Promise<CreateV4PersonaUnifiedResponse> {
  try {
    console.log('🚀 Starting V4 Unified Persona Creation');
    console.log('📤 Request:', {
      user_description: request.user_description?.slice(0, 100) + '...',
      user_id: request.user_id
    });

    console.log('💰 About to call billing-enabled edge function...');
    const { data, error } = await supabase.functions.invoke('reserve_and_execute', {
      body: {
        userId: request.user_id,
        actionType: 'persona_query',
        actionPayload: {
          user_description: request.user_description,
          user_id: request.user_id
        },
        idempotencyKey: `persona-${request.user_id}-${Date.now()}`
      }
    });
    console.log('💰 Billing-enabled function call completed. Error:', error, 'Data:', data);

    if (error) {
      console.error('❌ Error in unified persona creation:', error);
      throw error;
    }

    console.log('✅ Unified persona creation completed successfully:', {
      persona_id: data.result.persona_id,
      persona_name: data.result.persona_name,
      stage: data.result.stage,
      credits_used: data.creditsUsed,
      usage_id: data.usageId
    });

    return {
      success: true,
      persona_id: data.result.persona_id,
      persona_name: data.result.persona_name,
      stage: data.result.stage,
      background: data.result.background,
      character_description: data.result.character_description,
      physical_description: data.result.physical_description,
      message: data.result.message
    };

  } catch (error) {
    console.error('❌ Error in createV4PersonaUnified:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}