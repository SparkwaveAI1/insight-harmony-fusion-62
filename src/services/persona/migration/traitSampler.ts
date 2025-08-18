import { Persona } from '../types/persona';
import { PersonaV2 } from '../../../types/persona-v2';

export interface TraitSample {
  demographics: {
    age?: number;
    location?: string;
    occupation?: string;
    income_level?: string;
    education?: string;
  };
  bigFive: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
  behavioral: {
    communication_style?: string;
    decision_making?: string;
    stress_response?: string;
    social_orientation?: string;
  };
  essence: string; // Natural language description
}

export function samplePersonaTraits(persona: Persona): TraitSample {
  const sample: TraitSample = {
    demographics: {},
    bigFive: {},
    behavioral: {},
    essence: ''
  };

  // Extract demographics from metadata
  if (persona.metadata) {
    sample.demographics = {
      age: typeof persona.metadata.age === 'string' ? parseInt(persona.metadata.age) : persona.metadata.age,
      location: persona.metadata.location || persona.metadata.region,
      occupation: persona.metadata.occupation || persona.metadata.profession,
      income_level: persona.metadata.income_level,
      education: persona.metadata.education
    };
  }

  // Extract Big Five traits from trait_profile
  if (persona.trait_profile) {
    const traits = persona.trait_profile;
    // Access Big Five from the proper nested structure
    const bigFive = traits.big_five || {};
    const extended = traits.extended_traits || {};
    
    sample.bigFive = {
      openness: bigFive.openness || extended.truth_orientation,
      conscientiousness: bigFive.conscientiousness,
      extraversion: bigFive.extraversion,
      agreeableness: bigFive.agreeableness || extended.empathy,
      neuroticism: bigFive.neuroticism || extended.emotional_intensity
    };
  }

  // Extract behavioral patterns from linguistic_profile and simulation_directives
  if (persona.linguistic_profile || persona.simulation_directives) {
    const linguistic = persona.linguistic_profile || {};
    const simulation = persona.simulation_directives || {};
    
    sample.behavioral = {
      communication_style: linguistic.speech_register || 'neutral',
      decision_making: simulation.stress_behavior_expected ? 'stress-influenced' : 'measured',
      stress_response: simulation.stress_behavior_expected ? 'reactive' : 'stable',
      social_orientation: linguistic.cultural_speech_patterns || 'neutral'
    };
  }

  // Generate natural language essence
  sample.essence = generatePersonaEssence(persona, sample);

  return sample;
}

function generatePersonaEssence(persona: Persona, sample: TraitSample): string {
  const parts: string[] = [];

  // Basic identity
  if (persona.name) {
    parts.push(`A person named ${persona.name}`);
  }

  // Demographics
  if (sample.demographics.age) {
    parts.push(`aged ${sample.demographics.age}`);
  }
  if (sample.demographics.occupation) {
    parts.push(`working as a ${sample.demographics.occupation}`);
  }
  if (sample.demographics.location) {
    parts.push(`living in ${sample.demographics.location}`);
  }

  // Big Five traits (only include notable ones)
  const traitDescriptions: string[] = [];
  if (sample.bigFive.openness && sample.bigFive.openness > 0.7) {
    traitDescriptions.push('highly creative and open-minded');
  } else if (sample.bigFive.openness && sample.bigFive.openness < 0.3) {
    traitDescriptions.push('practical and traditional');
  }

  if (sample.bigFive.conscientiousness && sample.bigFive.conscientiousness > 0.7) {
    traitDescriptions.push('very organized and disciplined');
  } else if (sample.bigFive.conscientiousness && sample.bigFive.conscientiousness < 0.3) {
    traitDescriptions.push('spontaneous and flexible');
  }

  if (sample.bigFive.extraversion && sample.bigFive.extraversion > 0.7) {
    traitDescriptions.push('highly social and outgoing');
  } else if (sample.bigFive.extraversion && sample.bigFive.extraversion < 0.3) {
    traitDescriptions.push('introverted and reflective');
  }

  if (sample.bigFive.agreeableness && sample.bigFive.agreeableness > 0.7) {
    traitDescriptions.push('compassionate and cooperative');
  } else if (sample.bigFive.agreeableness && sample.bigFive.agreeableness < 0.3) {
    traitDescriptions.push('competitive and direct');
  }

  if (sample.bigFive.neuroticism && sample.bigFive.neuroticism > 0.7) {
    traitDescriptions.push('sensitive and emotionally responsive');
  } else if (sample.bigFive.neuroticism && sample.bigFive.neuroticism < 0.3) {
    traitDescriptions.push('emotionally stable and calm');
  }

  if (traitDescriptions.length > 0) {
    parts.push(`who is ${traitDescriptions.join(', ')}`);
  }

  // Behavioral characteristics
  if (sample.behavioral.communication_style) {
    parts.push(`with a ${sample.behavioral.communication_style} communication style`);
  }

  // Add original description if available
  if (persona.description) {
    parts.push(`Originally described as: "${persona.description}"`);
  }

  return parts.join(', ') + '.';
}

export function generatePersonaV2Prompt(sample: TraitSample): string {
  let prompt = `Create a detailed persona with the following characteristics:\n\n`;
  
  prompt += `**Core Identity**: ${sample.essence}\n\n`;
  
  if (Object.keys(sample.demographics).length > 0) {
    prompt += `**Demographics**:\n`;
    Object.entries(sample.demographics).forEach(([key, value]) => {
      if (value) prompt += `- ${key.replace('_', ' ')}: ${value}\n`;
    });
    prompt += `\n`;
  }

  if (Object.keys(sample.bigFive).length > 0) {
    prompt += `**Personality Traits** (Big Five scale 0-1):\n`;
    Object.entries(sample.bigFive).forEach(([key, value]) => {
      if (value !== undefined) prompt += `- ${key}: ${value}\n`;
    });
    prompt += `\n`;
  }

  if (Object.keys(sample.behavioral).length > 0) {
    prompt += `**Behavioral Patterns**:\n`;
    Object.entries(sample.behavioral).forEach(([key, value]) => {
      if (value) prompt += `- ${key.replace('_', ' ')}: ${value}\n`;
    });
    prompt += `\n`;
  }

  prompt += `Please generate a comprehensive PersonaV2 that captures this personality accurately while filling in missing details with realistic, consistent characteristics.`;

  return prompt;
}