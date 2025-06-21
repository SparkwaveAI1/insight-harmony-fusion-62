
import { PersonaTemplate } from "../types.ts";
import { generateBehavioralLinguistic } from "../openaiService.ts";
import { PersonaGenerationError, wrapWithErrorHandling } from "../errorHandler.ts";
import { withRetry } from "../retryService.ts";

export async function generatePersonaBehavioralLinguistic(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 9: GENERATING BEHAVIORAL & LINGUISTIC PROFILES ===');
  
  const behavioralLinguistic = await wrapWithErrorHandling(
    () => withRetry(
      () => generateBehavioralLinguistic(basePersona, prompt),
      { maxRetries: 1 },
      'Behavioral Linguistic Generation'
    ),
    'behavioral_linguistic',
    { personaName: basePersona.name }
  );
  
  console.log('✅ Generated behavioral and linguistic profiles');
  return behavioralLinguistic;
}
