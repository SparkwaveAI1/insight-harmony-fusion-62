
import { PersonaTemplate } from "./types.ts";
import { 
  generateCoreDemographics,
  generateLifeContext,
  generateKnowledgeProfile,
  generateCognitiveProfile,
  generateInterviewResponses
} from "./openaiService.ts";
import {
  generateMemory,
  generateStateModifiers,
  generateLinguisticStyle,
  generateSocialProfiles,
  generateRuntimeControls
} from "./v3Generators.ts";
import { validateAndCleanTraits } from "./traitValidator.ts";
import { 
  validateUserPrompt, 
  validateGeneratedPersona, 
  validateTraitValues 
} from "./validationService.ts";
import { 
  PersonaGenerationError, 
  wrapWithErrorHandling 
} from "./errorHandler.ts";
import { withRetry } from "./retryService.ts";
import { 
  validateTraitRealism, 
  validateDemographicStructure, 
  validateCompleteMetadata,
  validatePersonaUniqueness 
} from "./validationHelpers.ts";

export async function generateBasePersona(prompt: string): Promise<PersonaTemplate> {
  console.log('=== STAGE 1: GENERATING CORE DEMOGRAPHICS ===');
  
  const basePersona = await wrapWithErrorHandling(
    () => withRetry(
      () => generateCoreDemographics(prompt),
      { maxRetries: 2 },
      'Core Demographics Generation'
    ),
    'demographics',
    { prompt: prompt.substring(0, 100) + '...' }
  );

  console.log(`✅ Generated base persona "${basePersona.name}"`);
  
  // Validate ONLY core demographic structure (Stage 1 fields)
  const demographicValidation = validateDemographicStructure(basePersona.metadata);
  if (!demographicValidation.isValid) {
    console.error('❌ Core demographic validation failed:', demographicValidation.errors);
    throw new PersonaGenerationError(
      'demographics',
      `Core demographics validation failed: ${demographicValidation.errors.join(', ')}`,
      undefined,
      { personaName: basePersona.name, errors: demographicValidation.errors }
    );
  }
  
  return basePersona;
}

export async function enhancePersonaV3Components(basePersona: PersonaTemplate, prompt: string): Promise<PersonaTemplate> {
  console.log('=== STAGE 2-6: GENERATING V3 COMPONENTS ===');
  
  // Stage 2: Life Context
  console.log('Generating V3 life context...');
  const lifeContext = await wrapWithErrorHandling(
    () => withRetry(
      () => generateLifeContext(basePersona, prompt),
      { maxRetries: 1 },
      'Life Context Generation'
    ),
    'life_context',
    { personaName: basePersona.name }
  );
  
  // Stage 3: Knowledge Profile
  console.log('Generating V3 knowledge profile...');
  const knowledgeProfile = await wrapWithErrorHandling(
    () => withRetry(
      () => generateKnowledgeProfile(basePersona, prompt),
      { maxRetries: 1 },
      'Knowledge Profile Generation'
    ),
    'knowledge_profile',
    { personaName: basePersona.name }
  );
  
  // Stage 4: Memory
  console.log('Generating V3 memory...');
  const memory = await wrapWithErrorHandling(
    () => withRetry(
      () => generateMemory(basePersona, prompt),
      { maxRetries: 1 },
      'Memory Generation'
    ),
    'memory',
    { personaName: basePersona.name }
  );
  
  // Stage 5: State Modifiers
  console.log('Generating V3 state modifiers...');
  const stateModifiers = await wrapWithErrorHandling(
    () => withRetry(
      () => generateStateModifiers(basePersona, prompt),
      { maxRetries: 1 },
      'State Modifiers Generation'
    ),
    'state_modifiers',
    { personaName: basePersona.name }
  );
  
  // Stage 6: Linguistic Style
  console.log('Generating V3 linguistic style...');
  const linguisticStyle = await wrapWithErrorHandling(
    () => withRetry(
      () => generateLinguisticStyle(basePersona, prompt),
      { maxRetries: 1 },
      'Linguistic Style Generation'
    ),
    'linguistic_style',
    { personaName: basePersona.name }
  );
  
  // Merge V3 components into the persona
  Object.assign(basePersona, {
    life_context: lifeContext.life_context,
    knowledge_profile: knowledgeProfile.knowledge_profile,
    memory: memory.memory,
    state_modifiers: stateModifiers.state_modifiers,
    linguistic_style: linguisticStyle.linguistic_style
  });
  
  console.log('✅ Enhanced persona with all V3 components');
  return basePersona;
}

export async function generatePersonaCognitiveProfile(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 7: GENERATING V3 COGNITIVE PROFILE ===');
  
  let cognitiveData;
  let attemptCount = 0;
  const maxAttempts = 3;
  
  do {
    attemptCount++;
    console.log(`=== COGNITIVE PROFILE GENERATION ATTEMPT ${attemptCount}/${maxAttempts} ===`);
    
    try {
      cognitiveData = await wrapWithErrorHandling(
        () => withRetry(
          () => generateCognitiveProfile(basePersona, prompt),
          { maxRetries: 1 },
          'Cognitive Profile Generation'
        ),
        'cognitive_profile',
        { personaName: basePersona.name, attempt: attemptCount }
      );

      // Basic validation - ensure we have required structure
      if (!cognitiveData.cognitive_profile || !cognitiveData.cognitive_profile.big_five) {
        throw new Error('Missing required cognitive profile structure');
      }
      
      console.log(`✅ Cognitive profile generated successfully on attempt ${attemptCount}`);
      break;
      
    } catch (error) {
      console.error(`Cognitive profile generation attempt ${attemptCount} failed:`, error.message);
      
      if (attemptCount >= maxAttempts) {
        throw new PersonaGenerationError(
          'cognitive_profile',
          `All cognitive profile generation attempts failed. Last error: ${error.message}`,
          error,
          { personaName: basePersona.name, attempts: attemptCount }
        );
      }
    }
  } while (attemptCount < maxAttempts);

  console.log('✅ Generated and validated V3 cognitive profile');
  return { cognitiveData, attemptCount };
}

export async function generatePersonaSocialProfiles(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 8: GENERATING V3 SOCIAL PROFILES ===');
  
  const socialProfiles = await wrapWithErrorHandling(
    () => withRetry(
      () => generateSocialProfiles(basePersona, prompt),
      { maxRetries: 1 },
      'Social Profiles Generation'
    ),
    'social_profiles',
    { personaName: basePersona.name }
  );
  
  console.log('✅ Generated V3 social profiles');
  return socialProfiles;
}

export async function generatePersonaInterview(basePersona: PersonaTemplate): Promise<any[]> {
  console.log('=== STAGE 10: GENERATING INTERVIEW RESPONSES ===');
  
  try {
    const interviewResponses = await wrapWithErrorHandling(
      () => withRetry(
        () => generateInterviewResponses(basePersona),
        { maxRetries: 1 },
        'Interview Generation'
      ),
      'interview',
      { personaName: basePersona.name }
    );
    console.log(`✅ Generated ${interviewResponses.length} interview sections`);
    return interviewResponses;
  } catch (error) {
    console.warn('Interview generation failed, using minimal fallback:', error.message);
    return [
      {
        section_title: "Personal Background",
        responses: [
          {
            question: "Tell me about yourself",
            answer: `Hi, I'm ${basePersona.name}. I'm a ${basePersona.identity?.occupation || 'professional'} living in ${basePersona.identity?.location?.city || 'my current city'}. I'd be happy to share more about my experiences and perspective.`
          }
        ]
      }
    ];
  }
}

export async function generatePersonaRuntimeControls(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 9: GENERATING V3 RUNTIME CONTROLS ===');
  
  const runtimeControls = await wrapWithErrorHandling(
    () => withRetry(
      () => generateRuntimeControls(basePersona, prompt),
      { maxRetries: 1 },
      'Runtime Controls Generation'
    ),
    'runtime_controls',
    { personaName: basePersona.name }
  );
  
  console.log('✅ Generated V3 runtime controls');
  return runtimeControls;
}

export function finalizePersonaV3(
  basePersona: PersonaTemplate, 
  cognitiveData: any, 
  socialProfiles: any,
  runtimeControls: any,
  interviewResponses: any[]
): PersonaTemplate {
  console.log('=== FINALIZING V3 PERSONA ===');
  
  // Generate description from identity and cognitive profile
  const description = generateV3PersonaDescription(basePersona, cognitiveData);
  
  // Merge all V3 components into the base persona
  Object.assign(basePersona, {
    version: "3.0",
    description: description,
    cognitive_profile: cognitiveData.cognitive_profile,
    emotional_triggers: cognitiveData.emotional_triggers,
    group_behavior: socialProfiles.group_behavior,
    social_cognition: socialProfiles.social_cognition,
    sexuality_profile: socialProfiles.sexuality_profile,
    runtime_controls: runtimeControls.runtime_controls
  });
  
  basePersona.interview_sections = interviewResponses;

  // Basic V3 validation
  if (!basePersona.identity || !basePersona.cognitive_profile || !basePersona.life_context) {
    throw new PersonaGenerationError(
      'validation', 
      'Generated V3 persona is missing required components',
      undefined,
      { personaName: basePersona.name }
    );
  }

  console.log('✅ V3 Persona finalized and validated');
  return basePersona;
}

function generateV3PersonaDescription(persona: PersonaTemplate, cognitiveData: any): string {
  // Extract key characteristics
  const name = persona.name;
  const identity = persona.identity;
  const cognitive = cognitiveData.cognitive_profile;
  
  const personalityTraits: string[] = [];
  
  // Big Five analysis for V3
  if (cognitive.big_five.extraversion > 0.7) personalityTraits.push("outgoing and energetic");
  else if (cognitive.big_five.extraversion < 0.3) personalityTraits.push("reserved and thoughtful");
  
  if (cognitive.big_five.openness > 0.7) personalityTraits.push("creative and curious");
  else if (cognitive.big_five.openness < 0.3) personalityTraits.push("practical and traditional");
  
  if (cognitive.big_five.conscientiousness > 0.7) personalityTraits.push("organized and disciplined");
  else if (cognitive.big_five.conscientiousness < 0.3) personalityTraits.push("flexible and spontaneous");
  
  if (cognitive.big_five.agreeableness > 0.7) personalityTraits.push("compassionate and cooperative");
  else if (cognitive.big_five.agreeableness < 0.3) personalityTraits.push("direct and competitive");
  
  // Values analysis for V3
  const valueTraits: string[] = [];
  if (cognitive.moral_foundations.care_harm > 0.7) valueTraits.push("deeply caring");
  if (cognitive.moral_foundations.fairness_cheating > 0.7) valueTraits.push("justice-oriented");
  if (cognitive.moral_foundations.liberty_oppression > 0.7) valueTraits.push("freedom-loving");
  
  // Build description
  let description = `${name} is`;
  
  if (identity?.age) description += ` a ${identity.age}-year-old`;
  if (identity?.occupation) description += ` ${identity.occupation}`;
  if (identity?.location?.city) description += ` from ${identity.location.city}`;
  
  description += ".";
  
  if (personalityTraits.length > 0) {
    description += ` They are ${personalityTraits.slice(0, 2).join(" and ")}.`;
  }
  
  if (valueTraits.length > 0) {
    description += ` ${valueTraits.join(" and ")}.`;
  }
  
  // Add worldview if available
  if (cognitive.worldview_summary) {
    description += ` ${cognitive.worldview_summary}`;
  }
  
  return description;
}

function generatePersonaDescription(persona: PersonaTemplate, traits: any): string {
  // Extract key characteristics
  const name = persona.name;
  const age = persona.metadata?.age;
  const occupation = persona.metadata?.occupation;
  const location = persona.metadata?.location;
  
  // Analyze traits
  const bigFive = traits.trait_profile?.big_five || {};
  const worldValues = traits.trait_profile?.world_values || {};
  const moral = traits.trait_profile?.moral_foundations || {};
  
  const personalityTraits: string[] = [];
  
  // Big Five analysis
  if (bigFive.extraversion > 0.7) personalityTraits.push("outgoing and energetic");
  else if (bigFive.extraversion < 0.3) personalityTraits.push("reserved and thoughtful");
  
  if (bigFive.openness > 0.7) personalityTraits.push("creative and curious");
  else if (bigFive.openness < 0.3) personalityTraits.push("practical and traditional");
  
  if (bigFive.conscientiousness > 0.7) personalityTraits.push("organized and disciplined");
  else if (bigFive.conscientiousness < 0.3) personalityTraits.push("flexible and spontaneous");
  
  if (bigFive.agreeableness > 0.7) personalityTraits.push("compassionate and cooperative");
  else if (bigFive.agreeableness < 0.3) personalityTraits.push("direct and competitive");
  
  // Values analysis
  const valueTraits: string[] = [];
  if (moral.care > 0.7) valueTraits.push("deeply caring");
  if (moral.fairness > 0.7) valueTraits.push("justice-oriented");
  if (moral.liberty > 0.7) valueTraits.push("freedom-loving");
  
  // Build description
  let description = `${name} is`;
  
  if (age) description += ` a ${age}-year-old`;
  if (occupation) description += ` ${occupation}`;
  if (location) description += ` from ${location}`;
  
  description += ".";
  
  if (personalityTraits.length > 0) {
    description += ` They are ${personalityTraits.slice(0, 2).join(" and ")}.`;
  }
  
  if (valueTraits.length > 0) {
    description += ` ${valueTraits.join(" and ")}.`;
  }
  
  return description;
}
