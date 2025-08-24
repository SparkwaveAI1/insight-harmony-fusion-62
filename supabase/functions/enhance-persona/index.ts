import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { validateUserAuthentication } from "./authService.ts";
import { 
  handleGenerationError, 
  PersonaGenerationError 
} from "./errorHandler.ts";
import { 
  generatePersonaTraitProfile,
  generatePersonaBehavioralLinguistic,
  generatePersonaInterview,
  enhancePersonaMetadata
} from "./personaGenerator.ts";
import { generateKnowledgeDomains } from "../_shared/knowledgeDomains.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface EnhancementOptions {
  enhanceEmotionalTriggers?: boolean;
  enhanceInterviewResponses?: boolean;
  enhanceTraitProfile?: boolean;
  enhanceMetadata?: boolean;
  enhanceKnowledgeDomains?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validation: Verify user authentication
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await validateUserAuthentication(authHeader);

    const { personaId, options } = await req.json() as { 
      personaId: string; 
      options: EnhancementOptions;
    };

    if (!personaId) {
      throw new PersonaGenerationError('validation', 'Persona ID is required');
    }

    console.log('=== STARTING PERSONA ENHANCEMENT ===');
    console.log(`User: ${user.id}`);
    console.log(`Persona ID: ${personaId}`);
    console.log(`Enhancement options:`, options);

    // Fetch the existing persona
    const { data: existingPersona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', personaId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingPersona) {
      throw new PersonaGenerationError('validation', 'Persona not found or access denied');
    }

    let enhancedPersona = { ...existingPersona };
    const enhancementLog: string[] = [];

    // Enhancement Phase 1: Emotional Triggers
    if (options.enhanceEmotionalTriggers) {
      console.log('🔄 Enhancing emotional triggers...');
      try {
        const behavioralLinguistic = await generatePersonaBehavioralLinguistic(enhancedPersona, enhancedPersona.prompt || '');
        
        if (behavioralLinguistic.emotional_triggers) {
          enhancedPersona.emotional_triggers = behavioralLinguistic.emotional_triggers;
          enhancementLog.push('Enhanced emotional triggers');
          console.log('✅ Emotional triggers enhanced');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enhance emotional triggers:', error);
        enhancementLog.push('Failed to enhance emotional triggers');
      }
    }

    // Enhancement Phase 2: Interview Responses
    if (options.enhanceInterviewResponses) {
      console.log('🔄 Enhancing interview responses...');
      try {
        const interviewData = await generatePersonaInterview(enhancedPersona);
        
        if (interviewData.interview_sections) {
          enhancedPersona.interview_sections = interviewData.interview_sections;
          enhancementLog.push('Enhanced interview responses');
          console.log('✅ Interview responses enhanced');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enhance interview responses:', error);
        enhancementLog.push('Failed to enhance interview responses');
      }
    }

    // Enhancement Phase 3: Trait Profile
    if (options.enhanceTraitProfile) {
      console.log('🔄 Enhancing trait profile...');
      try {
        const { traitData } = await generatePersonaTraitProfile(enhancedPersona, enhancedPersona.prompt || '');
        
        if (traitData.trait_profile) {
          enhancedPersona.trait_profile = traitData.trait_profile;
          enhancementLog.push('Enhanced trait profile');
          console.log('✅ Trait profile enhanced');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enhance trait profile:', error);
        enhancementLog.push('Failed to enhance trait profile');
      }
    }

    // Enhancement Phase 4: Metadata
    if (options.enhanceMetadata) {
      console.log('🔄 Enhancing metadata...');
      try {
        const enhancedMetadata = await enhancePersonaMetadata(enhancedPersona, enhancedPersona.prompt || '');
        
        if (enhancedMetadata.metadata) {
          enhancedPersona.metadata = { ...enhancedPersona.metadata, ...enhancedMetadata.metadata };
          enhancementLog.push('Enhanced metadata');
          console.log('✅ Metadata enhanced');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enhance metadata:', error);
        enhancementLog.push('Failed to enhance metadata');
      }
    }

    // Enhancement Phase 5: Knowledge Domains (CRITICAL FIX)
    if (options.enhanceKnowledgeDomains) {
      console.log('🔄 Enhancing knowledge domains...');
      try {
        const knowledgeResult = await generateKnowledgeDomains(enhancedPersona);
        
        if (knowledgeResult.knowledge_domains) {
          enhancedPersona.metadata = { 
            ...enhancedPersona.metadata, 
            knowledge_domains: knowledgeResult.knowledge_domains 
          };
          enhancementLog.push('Enhanced knowledge domains');
          console.log('✅ Knowledge domains enhanced');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enhance knowledge domains:', error);
        enhancementLog.push('Failed to enhance knowledge domains');
      }
    }

    // Save the enhanced persona
    const { data: updatedPersona, error: updateError } = await supabase
      .from('v4_personas')
      .update({
        full_profile: {
          ...enhancedPersona.full_profile,
          emotional_triggers: enhancedPersona.emotional_triggers,
          interview_sections: enhancedPersona.interview_sections,
          trait_profile: enhancedPersona.trait_profile,
          metadata: enhancedPersona.metadata,
        }
      })
      .eq('persona_id', personaId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw new PersonaGenerationError('database', `Failed to save enhanced persona: ${updateError.message}`);
    }

    console.log('✅ PERSONA ENHANCEMENT COMPLETE');
    console.log('Enhancement log:', enhancementLog);

    return new Response(
      JSON.stringify({ 
        success: true,
        persona: updatedPersona,
        enhancementLog
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Enhancement error:', error);
    
    if (error instanceof PersonaGenerationError) {
      return handleGenerationError(error);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during enhancement',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});