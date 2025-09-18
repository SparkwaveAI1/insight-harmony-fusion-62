import { supabase } from '@/integrations/supabase/client';
import { validatePersona } from './v4PersonaValidation';

export interface CreateV4PersonaRequest {
  role?: string;
  region?: string;
  urbanicity?: string;
  age_range?: string;
  ethnicity?: string;
  income_bracket?: string;
  coherence_target?: number;
  user_id?: string; // Still needed for database storage
  user_prompt?: string; // Keep for backward compatibility
}

export interface CreateV4PersonaResponse {
  success: boolean;
  persona_id?: string;
  persona_name?: string;
  stage: string;
  error?: string;
  image_url?: string;
  message?: string;
  persona_data?: any;
}

export async function createV4PersonaCall1(request: CreateV4PersonaRequest): Promise<CreateV4PersonaResponse> {
  try {
    console.log('🚀 Starting V4 persona creation - Call 1 with optimized system');
    
    // Parse user_prompt if it's a simple text, or use structured parameters
    let personaParams = {
      role: request.role || 'professional',
      region: request.region || 'California',
      urbanicity: request.urbanicity || 'urban', 
      age_range: request.age_range || '25-35',
      ethnicity: request.ethnicity,
      income_bracket: request.income_bracket,
      coherence_target: request.coherence_target || 0.7
    };

    // If user_prompt is provided, try to extract parameters from it
    if (request.user_prompt && !request.role) {
      // Parse simple user prompts into parameters
      const prompt = request.user_prompt.toLowerCase();
      
      // Extract age range
      const ageMatch = prompt.match(/(\d+)[-–](\d+)/);
      if (ageMatch) {
        personaParams.age_range = `${ageMatch[1]}-${ageMatch[2]}`;
      }
      
      // Extract occupation/role
      const occupationWords = ['teacher', 'engineer', 'doctor', 'nurse', 'manager', 'developer', 'student', 'artist', 'writer'];
      const foundOccupation = occupationWords.find(occ => prompt.includes(occ));
      if (foundOccupation) {
        personaParams.role = foundOccupation;
      }
      
      // Extract location/region
      const regions = ['california', 'texas', 'florida', 'new york', 'midwest', 'south', 'northeast', 'west'];
      const foundRegion = regions.find(region => prompt.includes(region));
      if (foundRegion) {
        personaParams.region = foundRegion;
      }
    }
    
    const { data, error } = await supabase.functions.invoke('v4-persona-call1', {
      body: personaParams
    });

    if (error) {
      console.error('❌ Error in Call 1:', error);
      throw error;
    }

    console.log('✅ Call 1 completed successfully:', data);
    
    // If persona generation succeeded, store it in the database
    if (data.success && data.persona_data && request.user_id) {
      console.log('💾 Storing persona in database...');
      
      const persona_id = `v4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: dbData, error: dbError } = await supabase
        .from('v4_personas')
        .insert([
          {
            persona_id,
            name: data.persona_data.identity?.name || 'Unnamed Persona',
            user_id: request.user_id,
            full_profile: data.persona_data,
            conversation_summary: {},
            creation_stage: 'detailed_traits',
            creation_completed: false
          }
        ])
        .select();

      if (dbError) {
        console.error('❌ Database storage error:', dbError);
        throw new Error(`Failed to store persona: ${dbError.message}`);
      }
      
      console.log('✅ Persona stored successfully:', dbData?.[0]?.persona_id || 'stored');
      
      return {
        success: true,
        persona_id: dbData?.[0]?.persona_id || persona_id,
        persona_name: dbData?.[0]?.name || 'Unnamed Persona',
        stage: 'detailed_traits_complete',
        persona_data: data.persona_data
      };
    }
    
    // Return the raw data if no database storage needed
    return {
      success: data.success,
      stage: data.success ? 'generation_complete' : 'error',
      error: data.error,
      persona_data: data.persona_data
    };

  } catch (error) {
    console.error('❌ Error creating V4 persona Call 1:', error);
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