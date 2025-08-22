import { Persona } from '@/services/persona/types';

/**
 * Adapter service to make regular personas work with V4 conversation system
 * Converts regular persona format to V4-compatible conversation requests
 */

export interface PersonaAdapterRequest {
  persona: Persona;
  userMessage: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    image?: string;
  }>;
  mode?: 'conversation' | 'interview' | 'analysis';
  conversationContext?: string;
  imageData?: string | string[];
}

export interface PersonaAdapterResponse {
  success: boolean;
  response?: string;
  error?: string;
  persona_name?: string;
  model_used?: string;
}

/**
 * Adapts a regular persona to work with V4 conversation system
 * Creates a V4-compatible persona ID and handles the conversion
 */
export function adaptPersonaForV4(persona: Persona): string {
  // Create V4-compatible persona ID from regular persona
  // Use the existing persona_id but ensure it has v4_ prefix for V4 system
  if (persona.persona_id.startsWith('v4_')) {
    return persona.persona_id;
  }
  
  // For regular personas, create an adapter ID
  return `v4_adapted_${persona.persona_id}`;
}

/**
 * Converts a regular persona to V4 persona format for the conversation system
 * This allows the V4/Grok system to work with existing persona data
 */
export function convertPersonaToV4Format(persona: Persona) {
  return {
    id: adaptPersonaForV4(persona),
    persona_id: adaptPersonaForV4(persona),
    name: persona.name,
    description: persona.description,
    profile_image_url: persona.profile_image_url,
    
    // Convert persona data to V4 format
    biographical_info: {
      age: persona.metadata?.age || 'Unknown',
      gender: persona.metadata?.gender || 'Unknown',
      occupation: persona.metadata?.occupation || 'Unknown',
      region: persona.metadata?.region || 'Unknown',
      background: (persona as any).biographical_info || persona.description || 'No background provided'
    },
    
    // Map existing traits to V4 traits structure (use any to handle different persona structures)
    traits: {
      personality: (persona as any).traits?.personality || {},
      values: (persona as any).traits?.values || {},
      communication_style: (persona as any).traits?.communication_style || {},
      decision_making: (persona as any).traits?.decision_making || {},
      social_behavior: (persona as any).traits?.social_behavior || {}
    },
    
    // Convert interview sections if available
    interview_sections: (persona as any).interview_sections || [],
    
    // Preserve metadata
    metadata: persona.metadata || {},
    
    // Add V4-specific fields with defaults (use any for optional V4 fields)
    linguistic_style: (persona as any).linguistic_style || {},
    cultural_background: (persona as any).cultural_background || {},
    life_experiences: (persona as any).life_experiences || [],
    goals_motivations: (persona as any).goals_motivations || {},
    
    created_at: persona.created_at,
    updated_at: persona.updated_at,
    user_id: persona.user_id
  };
}

/**
 * Main adapter function that handles persona conversation using V4/Grok system
 * This function bridges regular personas to the V4 conversation engine via edge function
 */
export async function sendMessageToPersonaViaV4(request: PersonaAdapterRequest): Promise<PersonaAdapterResponse> {
  try {
    console.log('🔄 Adapting persona for V4/Grok system:', request.persona.name);
    
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    const v4PersonaId = adaptPersonaForV4(request.persona);
    
    console.log('📤 Sending to V4/Grok adapter with persona ID:', v4PersonaId);
    
    // Call the V4 persona adapter edge function
    const { data, error } = await supabase.functions.invoke('v4-persona-adapter', {
      body: {
        persona_id: v4PersonaId,
        user_message: request.userMessage,
        conversation_history: request.conversationHistory,
        conversation_context: request.conversationContext,
        image_data: Array.isArray(request.imageData) ? request.imageData.join(',') : request.imageData
      }
    });
    
    if (error) {
      console.error('❌ V4 Persona Adapter error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error from V4 adapter'
      };
    }
    
    if (data?.success) {
      console.log('✅ V4/Grok response received for:', request.persona.name);
      return {
        success: true,
        response: data.response,
        persona_name: request.persona.name,
        model_used: data.model_used || 'grok-via-v4-adapter'
      };
    } else {
      console.error('❌ V4/Grok response failed:', data?.error);
      return {
        success: false,
        error: data?.error || 'Unknown error from V4 system'
      };
    }
    
  } catch (error) {
    console.error('❌ Persona V4 adapter error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown adapter error'
    };
  }
}

/**
 * Batch process multiple personas using V4/Grok system
 * Used by insights engine for parallel processing
 */
export async function sendMessageToMultiplePersonasViaV4(
  personas: Persona[],
  userMessage: string,
  conversationHistories: Record<string, Array<{ role: 'user' | 'assistant'; content: string; image?: string }>> = {},
  conversationContext: string = '',
  imageData?: string | string[]
): Promise<Record<string, PersonaAdapterResponse>> {
  
  console.log('📊 Processing multiple personas via V4/Grok:', personas.length);
  
  const results: Record<string, PersonaAdapterResponse> = {};
  
  // Process personas in parallel using V4 system
  const promises = personas.map(async (persona) => {
    const personaHistory = conversationHistories[persona.persona_id] || [];
    
    const response = await sendMessageToPersonaViaV4({
      persona,
      userMessage,
      conversationHistory: personaHistory,
      conversationContext,
      imageData
    });
    
    results[persona.persona_id] = response;
  });
  
  await Promise.all(promises);
  
  console.log('✅ V4/Grok batch processing complete');
  return results;
}