import { supabase } from '@/integrations/supabase/client';

export interface CreateV4PersonaRequest {
  user_prompt: string;
  user_id: string;
}

export interface CreateV4PersonaResponse {
  success: boolean;
  persona_id?: string;
  persona_name?: string;
  stage: string;
  error?: string;
  image_url?: string;
  message?: string;
}

export async function createV4PersonaCall1(request: CreateV4PersonaRequest): Promise<CreateV4PersonaResponse> {
  try {
    console.log('Starting V4 persona creation - Call 1');
    
    const { data, error } = await supabase.functions.invoke('v4-persona-call1', {
      body: {
        user_prompt: request.user_prompt,
        user_id: request.user_id
      }
    });

    if (error) {
      console.error('Error in Call 1:', error);
      throw error;
    }

    console.log('Call 1 completed successfully:', data);
    return data;

  } catch (error) {
    console.error('Error creating V4 persona Call 1:', error);
    return {
      success: false,
      stage: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function createV4PersonaCall2(persona_id: string): Promise<CreateV4PersonaResponse> {
  try {
    console.log('Starting V4 persona creation - Call 2 for persona:', persona_id);
    
    const { data, error } = await supabase.functions.invoke('v4-persona-call2', {
      body: {
        persona_id: persona_id
      }
    });

    if (error) {
      console.error('Error in Call 2:', error);
      throw error;
    }

    console.log('Call 2 completed successfully:', data);
    return data;

  } catch (error) {
    console.error('Error creating V4 persona Call 2:', error);
    return {
      success: false,
      stage: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function createV4PersonaCall3(persona_id: string, generateImage: boolean = true): Promise<CreateV4PersonaResponse> {
  try {
    console.log('Starting V4 persona creation - Call 3 (image generation) for persona:', persona_id);
    
    if (!generateImage) {
      console.log('Image generation skipped by user preference');
      return {
        success: true,
        persona_id: persona_id,
        stage: 'creation_complete'
      };
    }

    const { data, error } = await supabase.functions.invoke('v4-persona-call3', {
      body: {
        persona_id: persona_id
      }
    });

    if (error) {
      console.error('Error in Call 3 (image generation):', error);
      // Image generation failure is non-fatal
      return {
        success: true,
        persona_id: persona_id,
        stage: 'creation_complete',
        error: `Image generation failed: ${error.message}`
      };
    }

    console.log('Call 3 completed successfully:', data);
    return data;

  } catch (error) {
    console.error('Error creating V4 persona Call 3:', error);
    // Image generation failure is non-fatal
    return {
      success: true,
      persona_id: persona_id,
      stage: 'creation_complete',
      error: error instanceof Error ? `Image generation failed: ${error.message}` : 'Image generation failed'
    };
  }
}