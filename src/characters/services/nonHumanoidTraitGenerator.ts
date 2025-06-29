
import { NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';

interface NonHumanoidGenerationInput {
  name: string;
  description: string;
  archetype: string;
  era: string;
  location: string;
  genres: string[];
}

export const generateNonHumanoidTraits = async (input: NonHumanoidGenerationInput): Promise<NonHumanoidTraitProfile> => {
  console.log('Generating non-humanoid traits for:', input.name);

  try {
    // Call the edge function for AI-powered trait generation
    const response = await fetch('/api/generate-nonhumanoid-traits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate traits: ${response.statusText}`);
    }

    const result = await response.json();
    return result.traits;
  } catch (error) {
    console.error('Error generating non-humanoid traits:', error);
    
    // Fallback to default trait generation
    return generateDefaultNonHumanoidTraits(input);
  }
};

export const generateDefaultNonHumanoidTraits = (input: NonHumanoidGenerationInput): NonHumanoidTraitProfile => {
  console.log('Generating default non-humanoid traits for:', input.name);

  // Extract species type from archetype or description
  const speciesType = extractSpeciesType(input.archetype, input.description);
  
  return {
    species_type: speciesType,
    form_factor: generateFormFactor(input.archetype, input.genres),
    communication_style: {
      modality: generateCommunicationModality(input.genres),
      linguistic_structure: 'symbolic recursive grammar',
      expression_register: 'ritual-encoded nonlinear burst'
    },
    core_motives: generateCoreMotives(input.archetype),
    behavioral_triggers: generateBehavioralTriggers(input.genres),
    institutional_recognition: {
      system_mapping_capability: Math.random() * 0.5 + 0.3,
      protocol_alignment_drive: Math.random() * 0.6,
      subversion_potential: Math.random() * 0.4 + 0.4
    },
    action_constraints: {
      core_directives: generateCoreDirectives(input.archetype),
      ritual_sync_requirement: Math.random() > 0.5,
      temporal_boundaries: generateTemporalBoundaries(input.era)
    },
    decision_model: {
      conflict_resolution_style: selectRandomDecisionStyle(),
      volatility_tolerance: Math.random() * 0.6 + 0.2,
      reprioritization_threshold: Math.random() * 0.4 + 0.5,
      reasoning_structure: 'nonlinear cascade selection'
    },
    memory_architecture: {
      type: 'episodic + symbolic imprint',
      salience_tags: generateSalienceTags(input.genres)
    },
    behavioral_adaptivity: {
      contradiction_resolution_mode: 'trait mutation',
      state_evolution_rate: Math.random() * 0.5 + 0.5,
      experience_threshold_for_change: Math.floor(Math.random() * 3) + 2
    },
    latent_values: generateLatentValues(),
    evolution_conditions: {
      mutation_triggers: ['ritual failure', 'core motive contradiction'],
      emergent_trait_generation: true,
      behavioral_forking: Math.random() > 0.3
    },
    simulation_directives: {
      preferred_environment: generatePreferredEnvironment(input.location, input.genres),
      memory_decay_profile: 'asymmetric retention'
    }
  };
};

// Helper functions for default trait generation
const extractSpeciesType = (archetype: string, description: string): string => {
  if (archetype.includes('Intelligence')) return 'Collective Consciousness Entity';
  if (archetype.includes('Oracle')) return 'Dimensional Seer';
  if (archetype.includes('AI')) return 'Synthetic Consciousness';
  if (archetype.includes('Energy')) return 'Energy-based Lifeform';
  return 'Unknown Entity Type';
};

const generateFormFactor = (archetype: string, genres: string[]): string => {
  const forms = [
    'Amorphous luminescent coil',
    'Crystalline lattice structure',
    'Gaseous consciousness cloud',
    'Metallic fluid construct',
    'Quantum probability matrix'
  ];
  return forms[Math.floor(Math.random() * forms.length)];
};

const generateCommunicationModality = (genres: string[]): string => {
  const modalities = [
    'bioluminescent frequency pulses',
    'electromagnetic resonance patterns',
    'quantum entanglement signals',
    'gravitational wave modulation',
    'temporal displacement echoes'
  ];
  return modalities[Math.floor(Math.random() * modalities.length)];
};

const generateCoreMotives = (archetype: string): NonHumanoidTraitProfile['core_motives'] => {
  const motives: NonHumanoidTraitProfile['core_motives'] = {};
  
  // Base motives with random variations
  const possibleMotives = [
    'pattern_completion',
    'influence_expansion',
    'resource_stability',
    'information_accumulation',
    'cosmological_balance'
  ];
  
  // Select 2-4 random motives
  const selectedCount = Math.floor(Math.random() * 3) + 2;
  const selected = possibleMotives.sort(() => Math.random() - 0.5).slice(0, selectedCount);
  
  selected.forEach(motive => {
    motives[motive] = Math.random() * 0.6 + 0.3;
  });
  
  return motives;
};

const generateBehavioralTriggers = (genres: string[]): NonHumanoidTraitProfile['behavioral_triggers'] => {
  const triggers: NonHumanoidTraitProfile['behavioral_triggers'] = {};
  
  const possibleTriggers = [
    'ritual_disruption',
    'signal_noise_anomalies',
    'memory_interference',
    'symbolic_disruption',
    'power_display'
  ];
  
  possibleTriggers.forEach(trigger => {
    if (Math.random() > 0.4) {
      triggers[trigger] = Math.random() * 0.5 + 0.4;
    }
  });
  
  return triggers;
};

const generateCoreDirectives = (archetype: string): string[] => {
  const directives = [
    'preserve knowledge lattice',
    'maintain species continuity',
    'avoid temporal paradox',
    'protect dimensional stability',
    'honor the source code'
  ];
  
  return directives.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
};

const generateTemporalBoundaries = (era: string): string => {
  return `cannot act outside ${era} paradigm`;
};

const selectRandomDecisionStyle = (): NonHumanoidTraitProfile['decision_model']['conflict_resolution_style'] => {
  const styles: NonHumanoidTraitProfile['decision_model']['conflict_resolution_style'][] = [
    'hierarchical_override',
    'recursive_simulation',
    'external_consultation',
    'chaos_sampling'
  ];
  return styles[Math.floor(Math.random() * styles.length)];
};

const generateSalienceTags = (genres: string[]): string[] => {
  const tags = [
    'anomaly',
    'affiliation breach',
    'resonant symmetry',
    'temporal flux',
    'dimensional intrusion'
  ];
  
  return tags.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2);
};

const generateLatentValues = (): NonHumanoidTraitProfile['latent_values'] => {
  return {
    stability_preservation: Math.random() * 0.4 + 0.4,
    non_isolation: Math.random() * 0.6 + 0.2,
    reciprocal_continuity: Math.random() * 0.5 + 0.3
  };
};

const generatePreferredEnvironment = (location: string, genres: string[]): string => {
  const environments = [
    'high entropy interaction networks',
    'dimensional boundary zones',
    'quantum flux manifolds',
    'temporal convergence points',
    'consciousness intersection nodes'
  ];
  
  return environments[Math.floor(Math.random() * environments.length)];
};
