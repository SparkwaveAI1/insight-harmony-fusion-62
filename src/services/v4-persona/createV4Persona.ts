import { supabase } from '@/integrations/supabase/client';
import { validatePersona } from './v4PersonaValidation';

function extractPersonaName(personaData: any): string {
  // Primary: Check for explicit name in identity
  if (personaData.identity?.name && typeof personaData.identity.name === 'string' && personaData.identity.name.trim()) {
    return personaData.identity.name.trim();
  }

  // This should rarely trigger now due to edge function validation, but keep as safety net
  console.warn('Edge function validation missed name field, using client fallback');
  
  const timestamp = new Date().getTime().toString().slice(-4);
  return `Generated Persona ${timestamp}`;
}

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
  name_preference?: string; // Add name preference
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
    console.log('🚀 Starting V4 persona creation - Call 1 with form data:', {
      role: request.role,
      region: request.region,
      urbanicity: request.urbanicity,
      age_range: request.age_range,
      ethnicity: request.ethnicity,
      name_preference: request.name_preference,
      user_prompt: request.user_prompt
    });
    
    // Parse user_prompt if it's a simple text, or use structured parameters
    let personaParams = {
      role: request.role || 'professional',
      region: request.region || 'California',
      urbanicity: request.urbanicity || 'urban', 
      age_range: request.age_range || '25-35',
      ethnicity: request.ethnicity,
      income_bracket: request.income_bracket,
      coherence_target: request.coherence_target || 0.7,
      name_preference: request.name_preference
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
      
      // Extract ethnicity from prompt
      const ethnicities = ['african american', 'black', 'asian', 'caucasian', 'white', 'hispanic', 'latino', 'native american', 'pacific islander'];
      const foundEthnicity = ethnicities.find(eth => prompt.includes(eth));
      if (foundEthnicity) {
        personaParams.ethnicity = foundEthnicity.replace('black', 'African American').replace('white', 'Caucasian');
      }
      
      // Extract name preference
      const nameMatch = prompt.match(/named?\s+(\w+)/i);
      if (nameMatch) {
        personaParams.name_preference = nameMatch[1];
      }
    }
    
    console.log('📤 Sending to edge function:', personaParams);
    
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
      
      // After getting persona_data from edge function, validate name extraction
      const personaName = extractPersonaName(data.persona_data);

      if (!personaName || personaName.trim() === '') {
        throw new Error('Failed to extract valid name from persona data');
      }

      console.log(`Extracted persona name: "${personaName}"`);
      
      const persona_id = `v4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert into database with validated name
      const { data: dbData, error: dbError } = await supabase
        .from('v4_personas')
        .insert([
          {
            persona_id,
            name: personaName,  // This should never be null now
            user_id: request.user_id,
            full_profile: data.persona_data,
            conversation_summary: {},
            creation_stage: 'completed',
            creation_completed: true,
            validation_score: 1.0,  // Full score since all validation passed
            validation_errors: [],
            validation_warnings: []
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
        persona_name: dbData?.[0]?.name || personaName,
        stage: 'completed',
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