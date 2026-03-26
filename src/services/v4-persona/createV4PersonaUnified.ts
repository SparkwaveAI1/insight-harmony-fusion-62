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

    console.log('📞 About to call edge function...');
    const { data, error } = await supabase.functions.invoke('v4-persona-unified-grok', {
      body: {
        user_description: request.user_description,
        user_id: request.user_id
      }
    });
    console.log('📞 Edge function call completed. Error:', error, 'Data:', data);

    if (error) {
      console.error('❌ Error in unified persona creation:', error);
      throw error;
    }

    console.log('✅ Unified persona creation completed successfully:', {
      persona_id: data.persona_id,
      persona_name: data.persona_name,
      stage: data.stage
    });

    return {
      success: true,
      persona_id: data.persona_id,
      persona_name: data.persona_name,
      stage: data.stage,
      background: data.background,
      character_description: data.character_description,
      physical_description: data.physical_description,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error in createV4PersonaUnified:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}