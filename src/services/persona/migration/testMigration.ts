import { samplePersonaTraits, generatePersonaV2Prompt } from './traitSampler';
import { Persona } from '../types/persona';

// Test persona data (simulating V1 persona structure)
const mockPersonaV1: Partial<Persona> = {
  persona_id: 'test-persona-123',
  name: 'Dr. Sarah Chen',
  description: 'A compassionate pediatric surgeon with anxiety tendencies',
  metadata: {
    age: '35', // String type as expected by metadata interface
    location: 'San Francisco, CA',
    occupation: 'Pediatric Surgeon',
    income_level: 'high',
    education: 'MD from Stanford University'
  } as any, // Cast to handle type differences
  trait_profile: {
    big_five: {
      openness: 0.8,
      conscientiousness: 0.9,
      extraversion: 0.4,
      agreeableness: 0.85,
      neuroticism: 0.6
    },
    extended_traits: {
      empathy: 0.9,
      emotional_intensity: 0.7
    }
  },
  linguistic_profile: {
    speech_register: 'professional',
    cultural_speech_patterns: 'West Coast American',
    sample_phrasing: ['Well, let me think about that...', 'From my experience...']
  },
  simulation_directives: {
    stress_behavior_expected: true,
    emotional_asymmetry: true
  }
};

/**
 * Test the trait sampling and prompt generation
 */
export function testTraitSampling() {
  console.log('🔬 Testing Trait Sampling Pipeline...\n');
  
  // Step 1: Sample traits from mock V1 persona
  console.log('📊 Step 1: Sampling traits from V1 persona...');
  const traitSample = samplePersonaTraits(mockPersonaV1 as Persona);
  
  console.log('Demographics:', traitSample.demographics);
  console.log('Big Five:', traitSample.bigFive);
  console.log('Behavioral:', traitSample.behavioral);
  console.log('Essence:', traitSample.essence);
  console.log('\n');
  
  // Step 2: Generate PersonaV2 prompt
  console.log('✍️ Step 2: Generating PersonaV2 prompt...');
  const prompt = generatePersonaV2Prompt(traitSample);
  
  console.log('Generated Prompt:');
  console.log('='.repeat(50));
  console.log(prompt);
  console.log('='.repeat(50));
  console.log('\n');
  
  // Step 3: Validate prompt quality
  console.log('✅ Step 3: Validating prompt quality...');
  const promptLength = prompt.length;
  const hasCore = prompt.includes('Core Identity');
  const hasDemographics = prompt.includes('Demographics');
  const hasTraits = prompt.includes('Personality Traits');
  
  console.log(`Prompt length: ${promptLength} characters`);
  console.log(`Contains core identity: ${hasCore}`);
  console.log(`Contains demographics: ${hasDemographics}`);
  console.log(`Contains personality traits: ${hasTraits}`);
  
  const isValid = promptLength > 200 && hasCore && hasDemographics && hasTraits;
  console.log(`\n${isValid ? '🎉' : '❌'} Prompt validation: ${isValid ? 'PASSED' : 'FAILED'}`);
  
  return {
    traitSample,
    prompt,
    isValid,
    stats: {
      promptLength,
      hasCore,
      hasDemographics,
      hasTraits
    }
  };
}

/**
 * Run the test when this file is imported
 */
if (typeof window !== 'undefined') {
  // Browser environment - can be called manually
  console.log('Migration test utilities loaded. Call testTraitSampling() to run tests.');
} else {
  // Node environment - run automatically
  testTraitSampling();
}