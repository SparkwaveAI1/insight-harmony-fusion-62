import { supabase } from "@/integrations/supabase/client";
import { Persona } from "./types";
import { voicepackCache } from "../voicepack";

export interface EnhancementOptions {
  enhanceEmotionalTriggers?: boolean;
  enhanceInterviewResponses?: boolean;
  enhanceTraitProfile?: boolean;
  enhanceMetadata?: boolean;
  enhanceKnowledgeDomains?: boolean;
}

export interface EnhancementResult {
  success: boolean;
  persona?: Persona;
  enhancementLog?: string[];
  error?: string;
}

export const enhancePersona = async (
  personaId: string, 
  options: EnhancementOptions
): Promise<EnhancementResult> => {
  try {
    console.log('Calling enhance-persona edge function...');
    console.log('PersonaId:', personaId);
    console.log('Options:', options);

    const { data, error } = await supabase.functions.invoke('enhance-persona', {
      body: { 
        personaId,
        options 
      }
    });

    if (error) {
      console.error('Enhancement edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enhance persona'
      };
    }

    if (!data.success) {
      console.error('Enhancement failed:', data);
      return {
        success: false,
        error: data.error || 'Enhancement process failed'
      };
    }

    console.log('Enhancement successful:', data.enhancementLog);
    
    // Invalidate voicepack cache and recompile after enhancement
    if (data.persona?.persona_id) {
      console.log('=== RECOMPILING VOICEPACK AFTER ENHANCEMENT ===');
      try {
        voicepackCache.invalidateCache(data.persona.persona_id);
        await voicepackCache.recompileVoicepack(data.persona.persona_id);
        console.log('✅ Voicepack recompiled after enhancement');
      } catch (voicepackError) {
        console.warn('⚠️ Voicepack recompilation failed:', voicepackError);
      }
    }
    
    return {
      success: true,
      persona: data.persona,
      enhancementLog: data.enhancementLog
    };

  } catch (error) {
    console.error('Enhancement service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};