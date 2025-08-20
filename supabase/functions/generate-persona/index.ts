
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
  generateV3Identity,
  generateV3LifeContext,
  generateV3KnowledgeProfile,
  generateV3CognitiveProfile,
  generateV3Interview
} from "./openaiService.ts";
import { 
  generateV3Memory,
  generateV3StateModifiers,
  generateV3LinguisticStyle,
  generateV3SocialProfiles,
  generateV3RuntimeControls
} from "./v3Generators.ts";
import { finalizePersonaV3 } from "./personaGenerator.ts";

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

    console.log('=== STARTING V3 PERSONA GENERATION (10 STAGES) ===');
    console.log(`User: ${user.id}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // STAGE 1: Generate V3 identity
    console.log('🔄 Stage 1: Generating V3 identity...');
    const identity = await generateV3Identity(prompt);
    console.log(`✅ Stage 1 Complete: Generated identity for "${identity.name}"`);
    
    // Generate unique persona_id and set user_id
    const persona_id = await validatePersonaUniqueness(supabase, { persona_id: '', name: identity.name });
    
    // STAGE 2: Generate life context
    console.log('🔄 Stage 2: Generating life context...');
    const life_context = await generateV3LifeContext(identity, prompt);
    console.log('✅ Stage 2 Complete: Generated life context');
    
    // STAGE 3: Generate knowledge profile
    console.log('🔄 Stage 3: Generating knowledge profile...');
    const knowledge_profile = await generateV3KnowledgeProfile(identity, prompt);
    console.log('✅ Stage 3 Complete: Generated knowledge profile');
    
    // STAGE 4: Generate cognitive profile
    console.log('🔄 Stage 4: Generating cognitive profile...');
    const cognitive_profile = await generateV3CognitiveProfile(identity, prompt);
    console.log('✅ Stage 4 Complete: Generated cognitive profile');
    
    // STAGE 5: Generate memory system
    console.log('🔄 Stage 5: Generating memory system...');
    const memory = await generateV3Memory(identity, prompt);
    console.log('✅ Stage 5 Complete: Generated memory system');

    // STAGE 6: Generate state modifiers
    console.log('🔄 Stage 6: Generating state modifiers...');
    const state_modifiers = await generateV3StateModifiers(identity, prompt);
    console.log('✅ Stage 6 Complete: Generated state modifiers');

    // STAGE 7: Generate linguistic style
    console.log('🔄 Stage 7: Generating linguistic style...');
    const linguistic_style = await generateV3LinguisticStyle(identity, prompt);
    console.log('✅ Stage 7 Complete: Generated linguistic style');

    // STAGE 8: Generate social profiles
    console.log('🔄 Stage 8: Generating social profiles...');
    const social_profiles = await generateV3SocialProfiles(identity, prompt);
    console.log('✅ Stage 8 Complete: Generated social profiles');

    // STAGE 9: Generate runtime controls
    console.log('🔄 Stage 9: Generating runtime controls...');
    const runtime_controls = await generateV3RuntimeControls(identity, prompt);
    console.log('✅ Stage 9 Complete: Generated runtime controls');

    // STAGE 10: Generate interview responses
    console.log('🔄 Stage 10: Generating interview responses...');
    const interview_sections = await generateV3Interview(identity);
    console.log(`✅ Stage 10 Complete: Generated ${interview_sections.length} interview sections`);

    // FINALIZATION: Assemble complete V3 persona
    console.log('🔄 Finalizing V3 persona...');
    const validatedPersona = finalizePersonaV3({
      persona_id,
      user_id: user.id,
      identity,
      life_context,
      knowledge_profile,
      cognitive_profile,
      memory,
      state_modifiers,
      linguistic_style,
      social_profiles: social_profiles,
      runtime_controls,
      interview_sections
    });

    console.log('=== V3 PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final V3 persona: ${validatedPersona.name} for user: ${user.id}`);
    console.log(`- Identity: ✓ (${validatedPersona.identity.age} years old)`);
    console.log(`- Cognitive profile: ✓ (Big Five + extended traits)`);
    console.log(`- Knowledge domains: ✓ (${Object.keys(validatedPersona.knowledge_profile.knowledge_domains).length} domains)`);
    console.log(`- Linguistic style: ✓`);
    console.log(`- Interview sections: ✓ (${validatedPersona.interview_sections?.length || 0} sections)`);

    return new Response(
      JSON.stringify({
        success: true,
        persona: validatedPersona,
        warnings: [],
        metadata: {
          hasRealisticTraits: true,
          demographicFieldsGenerated: Object.keys(validatedPersona.identity).length,
          generationStages: 10,
          version: "V3"
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
