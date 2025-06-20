
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

    console.log('=== STARTING STAGED PERSONA GENERATION ===');
    console.log(`User: ${user.id}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // STAGE 1: Generate base demographics
    console.log('🔄 Working on demographics...');
    const basePersona = await generateBasePersona(prompt);
    console.log(`✅ Stage 1 Complete: Generated base demographics for "${basePersona.name}"`);
    
    // Validate persona_id uniqueness and add user_id
    basePersona.persona_id = await validatePersonaUniqueness(supabase, basePersona);
    basePersona.user_id = user.id;
    
    // STAGE 2: Enhance metadata with health, physical, family, knowledge
    console.log('🔄 Working on detailed attributes...');
    const enhancedPersona = await enhancePersonaMetadata(basePersona, prompt);
    console.log('✅ Stage 2 Complete: Enhanced metadata with comprehensive attributes');
    
    // STAGE 3: Generate comprehensive trait profile
    console.log('🔄 Working on traits...');
    const { comprehensiveProfile, attemptCount } = await generatePersonaTraitProfile(enhancedPersona, prompt);
    console.log('✅ Stage 3 Complete: Generated and validated realistic trait profile');
    
    // STAGE 4: Generate interview responses
    console.log('🔄 Working on interview responses...');
    const interviewResponses = await generatePersonaInterview(enhancedPersona);
    console.log(`✅ Stage 4 Complete: Generated ${interviewResponses.length} interview sections`);

    // STAGE 5: Finalize and validate the complete persona
    console.log('🔄 Finalizing persona...');
    const validatedPersona = finalizePersona(enhancedPersona, comprehensiveProfile, interviewResponses);

    console.log('=== STAGED PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final persona: ${validatedPersona.name} for user: ${user.id}`);
    console.log(`- Demographics: ✓ (${Object.keys(validatedPersona.metadata).length} fields)`);
    console.log(`- Trait profile: ✓ (${Object.keys(validatedPersona.trait_profile).length} categories)`);
    console.log(`- Emotional triggers: ✓ (${validatedPersona.emotional_triggers?.positive_triggers?.length || 0}+${validatedPersona.emotional_triggers?.negative_triggers?.length || 0} triggers)`);
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
          generationStages: 5
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
