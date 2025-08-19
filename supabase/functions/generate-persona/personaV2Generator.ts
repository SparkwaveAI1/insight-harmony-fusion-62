
import { PersonaV2 } from "./personaV2Types.ts";
import { 
  generatePersonaV2Identity,
  generatePersonaV2LifeContext,
  generatePersonaV2CognitiveProfile,
  generatePersonaV2SocialCognition,
  generatePersonaV2HealthProfile,
  generatePersonaV2SexualityProfile,
  generatePersonaV2KnowledgeProfile,
  generatePersonaV2EmotionalTriggers,
  generatePersonaV2Description
} from "./openaiV2Service.ts";
import { 
  PersonaGenerationError, 
  wrapWithErrorHandling 
} from "./errorHandler.ts";
import { withRetry } from "./retryService.ts";
import { validatePersonaUniqueness } from "./validationHelpers.ts";

export async function generatePersonaV2(prompt: string, userId: string, supabase: any): Promise<PersonaV2> {
  console.log('=== STARTING PersonaV2 GENERATION ===');
  console.log(`User: ${userId}`);
  console.log(`Prompt length: ${prompt.length} characters`);
  
  // Stage 1: Generate Identity
  console.log('🔄 Stage 1: Generating identity...');
  const identity = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2Identity(prompt),
      { maxRetries: 2 },
      'Identity Generation'
    ),
    'identity',
    { prompt: prompt.substring(0, 100) + '...' }
  );
  console.log(`✅ Stage 1 Complete: Generated identity for "${identity.name}"`);

  // Stage 2: Generate Life Context
  console.log('🔄 Stage 2: Generating life context...');
  const lifeContext = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2LifeContext(identity, prompt),
      { maxRetries: 1 },
      'Life Context Generation'
    ),
    'life_context',
    { personaName: identity.name }
  );
  console.log('✅ Stage 2 Complete: Generated life context');

  // Stage 3: Generate Cognitive Profile
  console.log('🔄 Stage 3: Generating cognitive profile...');
  const cognitiveProfile = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2CognitiveProfile(identity, lifeContext, prompt),
      { maxRetries: 1 },
      'Cognitive Profile Generation'
    ),
    'cognitive_profile',
    { personaName: identity.name }
  );
  console.log('✅ Stage 3 Complete: Generated cognitive profile');

  // Stage 4: Generate Social Cognition
  console.log('🔄 Stage 4: Generating social cognition...');
  const socialCognition = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2SocialCognition(identity, cognitiveProfile, prompt),
      { maxRetries: 1 },
      'Social Cognition Generation'
    ),
    'social_cognition',
    { personaName: identity.name }
  );
  console.log('✅ Stage 4 Complete: Generated social cognition');

  // Stage 5: Generate Health Profile
  console.log('🔄 Stage 5: Generating health profile...');
  const healthProfile = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2HealthProfile(identity, lifeContext, prompt),
      { maxRetries: 1 },
      'Health Profile Generation'
    ),
    'health_profile',
    { personaName: identity.name }
  );
  console.log('✅ Stage 5 Complete: Generated health profile');

  // Stage 6: Generate Sexuality Profile (optional)
  console.log('🔄 Stage 6: Generating sexuality profile...');
  const sexualityProfile = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2SexualityProfile(identity, cognitiveProfile, prompt),
      { maxRetries: 1 },
      'Sexuality Profile Generation'
    ),
    'sexuality_profile',
    { personaName: identity.name }
  );
  console.log('✅ Stage 6 Complete: Generated sexuality profile');

  // Stage 7: Generate Knowledge Profile (optional)
  console.log('🔄 Stage 7: Generating knowledge profile...');
  const knowledgeProfile = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2KnowledgeProfile(identity, lifeContext, prompt),
      { maxRetries: 1 },
      'Knowledge Profile Generation'
    ),
    'knowledge_profile',
    { personaName: identity.name }
  );
  console.log('✅ Stage 7 Complete: Generated knowledge profile');

  // Stage 8: Generate Emotional Triggers (optional)
  console.log('🔄 Stage 8: Generating emotional triggers...');
  const emotionalTriggers = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2EmotionalTriggers(identity, cognitiveProfile, healthProfile, prompt),
      { maxRetries: 1 },
      'Emotional Triggers Generation'
    ),
    'emotional_triggers',
    { personaName: identity.name }
  );
  console.log('✅ Stage 8 Complete: Generated emotional triggers');

  // Generate unique persona ID
  const personaId = await validatePersonaUniqueness(supabase, { name: identity.name });

  // Stage 9: Generate AI Description
  console.log('🔄 Stage 9: Generating AI description...');
  const description = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaV2Description(identity, cognitiveProfile, lifeContext),
      { maxRetries: 1 },
      'Description Generation'
    ),
    'description',
    { personaName: identity.name }
  );
  console.log(`✅ Stage 9 Complete: Generated description (${description.length} chars)`);

  // Assemble final PersonaV2 - PROPER V2 FORMAT WITH DESCRIPTION
  const personaV2: PersonaV2 = {
    id: personaId,
    version: "2.1",
    created_at: new Date().toISOString(),
    persona_type: "simulated",
    locale: "en-US",
    identity,
    life_context: lifeContext,
    cognitive_profile: cognitiveProfile,
    social_cognition: socialCognition,
    health_profile: healthProfile,
    sexuality_profile: sexualityProfile,
    knowledge_profile: knowledgeProfile,
    emotional_triggers: emotionalTriggers,
    description: description // Include AI-generated description in persona data
  };

  console.log('=== PersonaV2 GENERATION COMPLETED SUCCESSFULLY ===');
  console.log(`Final PersonaV2: ${personaV2.identity.name}`);
  console.log(`- Version: ${personaV2.version}`);
  console.log(`- Identity: ✓ (age: ${personaV2.identity.age}, gender: ${personaV2.identity.gender})`);
  console.log(`- Life context: ✓`);
  console.log(`- Cognitive profile: ✓ (Big Five traits set)`);
  console.log(`- Social cognition: ✓`);
  console.log(`- Health profile: ✓`);
  console.log(`- Sexuality profile: ✓`);
  console.log(`- Knowledge profile: ✓`);
  console.log(`- Emotional triggers: ✓`);
  console.log(`- AI Description: ✓ (${description.length} characters)`);

  return personaV2;
}
