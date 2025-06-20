
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  validateUserPrompt 
} from "./validationService.ts";
import { 
  handleGenerationError, 
  PersonaGenerationError 
} from "./errorHandler.ts";
import { validateUserAuthentication } from "./authService.ts";
import { validatePersonaUniqueness } from "./validationHelpers.ts";
import { 
  generateBasePersona,
  enhancePersonaMetadata, 
  generatePersonaTraitProfile, 
  generatePersonaBehavioralLinguistic,
  generatePersonaInterview, 
  finalizePersona 
} from "./personaGenerator.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validation: Verify user authentication
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await validateUserAuthentication(authHeader);

    const { prompt } = await req.json();

    // Validate user input
    const promptValidation = validateUserPrompt(prompt);
    if (!promptValidation.isValid) {
      throw new PersonaGenerationError('validation', promptValidation.errors.join(', '));
    }

    if (promptValidation.warnings.length > 0) {
      console.warn('Prompt validation warnings:', promptValidation.warnings);
    }

    console.log('=== STARTING 10-STAGE PERSONA GENERATION ===');
    console.log(`User: ${user.id}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // STAGE 1: Generate core demographics
    console.log('🔄 Stage 1: Working on core demographics...');
    const basePersona = await generateBasePersona(prompt);
    console.log(`✅ Stage 1 Complete: Generated core demographics for "${basePersona.name}"`);
    
    // Validate persona_id uniqueness and add user_id
    basePersona.persona_id = await validatePersonaUniqueness(supabase, basePersona);
    basePersona.user_id = user.id;
    
    // STAGES 2-7: Enhance metadata with comprehensive attributes
    console.log('🔄 Stages 2-7: Working on comprehensive metadata...');
    const enhancedPersona = await enhancePersonaMetadata(basePersona, prompt);
    console.log('✅ Stages 2-7 Complete: Enhanced with location, family, health, physical, knowledge, and cultural data');
    
    // STAGE 8: Generate comprehensive trait profile
    console.log('🔄 Stage 8: Working on trait profile...');
    const { traitData, attemptCount } = await generatePersonaTraitProfile(enhancedPersona, prompt);
    console.log('✅ Stage 8 Complete: Generated and validated realistic trait profile');
    
    // STAGE 9: Generate behavioral and linguistic profiles
    console.log('🔄 Stage 9: Working on behavioral & linguistic profiles...');
    const behavioralLinguistic = await generatePersonaBehavioralLinguistic(enhancedPersona, prompt);
    console.log('✅ Stage 9 Complete: Generated behavioral and linguistic profiles');

    // STAGE 10: Generate interview responses
    console.log('🔄 Stage 10: Working on interview responses...');
    const interviewResponses = await generatePersonaInterview(enhancedPersona);
    console.log(`✅ Stage 10 Complete: Generated ${interviewResponses.length} interview sections`);

    // FINALIZATION: Validate and assemble the complete persona
    console.log('🔄 Finalizing persona...');
    const validatedPersona = finalizePersona(enhancedPersona, traitData, behavioralLinguistic, interviewResponses);

    console.log('=== 10-STAGE PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final persona: ${validatedPersona.name} for user: ${user.id}`);
    console.log(`- Core demographics: ✓ (${Object.keys(validatedPersona.metadata).length} fields)`);
    console.log(`- Trait profile: ✓ (${Object.keys(validatedPersona.trait_profile).length} categories)`);
    console.log(`- Emotional triggers: ✓ (${validatedPersona.emotional_triggers?.positive_triggers?.length || 0}+${validatedPersona.emotional_triggers?.negative_triggers?.length || 0} triggers)`);
    console.log(`- Behavioral profiles: ✓`);
    console.log(`- Interview sections: ✓ (${validatedPersona.interview_sections?.length || 0} sections)`);

    return new Response(
      JSON.stringify({
        success: true,
        persona: validatedPersona,
        warnings: [],
        metadata: {
          traitGenerationAttempts: attemptCount,
          hasRealisticTraits: true,
          demographicFieldsGenerated: Object.keys(validatedPersona.metadata).length,
          generationStages: 10
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    if (error instanceof PersonaGenerationError) {
      return handleGenerationError({
        step: error.step,
        error: error.originalError || error,
        context: error.context
      });
    }
    
    console.error('Unexpected error in persona generation:', error);
    return handleGenerationError({
      step: 'unknown',
      error: error as Error,
      context: { unexpected: true }
    });
  }
});
