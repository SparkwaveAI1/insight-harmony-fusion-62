
import { corsHeaders } from '../_shared/cors.ts';
import { ValidationRequest } from './types.ts';
import { buildValidationPrompt } from './promptBuilder.ts';
import { parseValidationResponse, createDefaultValidationResult } from './scoring.ts';
import { callOpenAIValidation } from './openaiClient.ts';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { response, persona, conversation_context, user_message }: ValidationRequest = await req.json();
    
    console.log(`Validating response for persona: ${persona.name}`);
    
    if (!response || !persona) {
      return new Response(
        JSON.stringify({ error: 'Missing response or persona data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create validation prompt
    const validationPrompt = buildValidationPrompt(persona, conversation_context, user_message, response);
    
    console.log('Calling OpenAI for validation...');

    // Call OpenAI for validation
    const rawResponse = await callOpenAIValidation(validationPrompt, openaiApiKey);
    console.log('Raw validation response:', rawResponse);
    
    // Parse and process the validation result
    const validationResult = parseValidationResponse(rawResponse);
    
    console.log(`Validation complete. Overall score: ${validationResult.scores.overall}`);
    
    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: `Validation failed: ${error instanceof Error ? error.message : String(error)}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
