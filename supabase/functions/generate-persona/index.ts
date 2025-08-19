
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
import { generatePersonaV2 } from "./personaV2Generator.ts";

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

    // Generate PersonaV2 directly
    const personaV2 = await generatePersonaV2(prompt, user.id, supabase);

    return new Response(
      JSON.stringify({
        success: true,
        persona: personaV2,
        warnings: [],
        metadata: {
          generationStages: 8,
          format: "PersonaV2"
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
