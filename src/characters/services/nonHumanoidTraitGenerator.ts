
import { supabase } from '@/integrations/supabase/client';
import { NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';

export interface NonHumanoidGenerationInput {
  name: string;
  description: string;
  entityType: string;
  narrativeDomain: string;
  functionalRole: string;
  environment: string;
  physicalForm: string;
  communication: string;
  coreDrives: string[];
  surfaceTriggers: string[];
  changeResponseStyle: string;
}

export const generateNonHumanoidTraits = async (input: NonHumanoidGenerationInput): Promise<NonHumanoidTraitProfile> => {
  console.log('=== GENERATING NON-HUMANOID TRAITS ===');
  console.log('Input data:', input);

  try {
    // Call the Supabase edge function for non-humanoid trait generation
    const { data, error } = await supabase.functions.invoke('generate-nonhumanoid-traits', {
      body: {
        creativeData: input
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to generate non-humanoid traits: ${error.message}`);
    }

    if (!data || !data.traitProfile) {
      console.error('Invalid response from edge function:', data);
      throw new Error('Invalid response from trait generation service');
    }

    console.log('✅ Non-humanoid traits generated successfully');
    return data.traitProfile;
  } catch (error) {
    console.error('Error generating non-humanoid traits:', error);
    
    // Fallback to local generation if edge function fails
    console.warn('Using fallback non-humanoid trait generation');
    return generateFallbackTraits(input);
  }
};

// Fallback implementation for when the edge function is unavailable
const generateFallbackTraits = (input: NonHumanoidGenerationInput): NonHumanoidTraitProfile => {
  return {
    species_type: input.entityType || 'Unknown',
    form_factor: input.physicalForm || 'Abstract',
    physical_manifestation: {
      primary_form: input.physicalForm || 'Energy Matrix',
      scale_category: determineScale(input.description),
      material_composition: determineMaterial(input.entityType),
      dimensional_properties: '3D Stable',
      luminescence_pattern: determineLuminescence(input.entityType),
      texture_quality: determineTexture(input.physicalForm),
      movement_characteristics: determineMovement(input.physicalForm),
      environmental_interaction: determineEnvironmentalInteraction(input.environment),
      sensory_emanations: determineSensoryEmanations(input.communication),
      structural_complexity: determineStructuralComplexity(input.entityType)
    },
    communication_style: {
      modality: input.communication || 'Unknown',
      linguistic_structure: 'Basic',
      expression_register: 'Neutral'
    },
    core_motives: {
      survival: 0.8,
      curiosity: 0.6,
      dominance: 0.4,
      affiliation: 0.7
    },
    behavioral_triggers: {
      threat: 0.9,
      opportunity: 0.7,
      novelty: 0.5,
      familiarity: 0.6
    },
    institutional_recognition: {
      system_mapping_capability: 0.6,
      protocol_alignment_drive: 0.7,
      subversion_potential: 0.4
    },
    action_constraints: {
      core_directives: input.coreDrives.length > 0 ? input.coreDrives : ['Observe', 'Adapt', 'Learn']
    },
    decision_model: {
      conflict_resolution_style: 'hierarchical_override',
      volatility_tolerance: 0.5,
      reprioritization_threshold: 0.6
    },
    memory_architecture: {
      type: 'Standard',
      salience_tags: ['primary', 'secondary']
    },
    behavioral_adaptivity: {
      contradiction_resolution_mode: input.changeResponseStyle || 'Integration',
      state_evolution_rate: 0.3,
      experience_threshold_for_change: 0.7
    },
    latent_values: {
      stability_preservation: 0.8,
      non_isolation: 0.6
    },
    evolution_conditions: {
      mutation_triggers: input.surfaceTriggers.length > 0 ? input.surfaceTriggers : ['contradiction', 'novelty'],
      emergent_trait_generation: true,
      behavioral_forking: false
    },
    simulation_directives: {
      preferred_environment: input.environment || 'Standard',
      memory_decay_profile: 'Stable'
    }
  };
};

// Helper functions for fallback appearance generation
const determineScale = (description: string): string => {
  const desc = description.toLowerCase();
  if (desc.includes('microscopic') || desc.includes('tiny')) return 'Microscopic';
  if (desc.includes('massive') || desc.includes('giant') || desc.includes('huge')) return 'Massive';
  if (desc.includes('planetary') || desc.includes('cosmic')) return 'Planetary';
  return 'Human-scale';
};

const determineMaterial = (entityType: string): string => {
  const type = entityType.toLowerCase();
  if (type.includes('energy') || type.includes('plasma')) return 'Pure Energy';
  if (type.includes('crystal') || type.includes('mineral')) return 'Living Crystal';
  if (type.includes('metal') || type.includes('machine')) return 'Metallic Liquid';
  if (type.includes('gas') || type.includes('vapor')) return 'Gaseous Compound';
  return 'Unknown Matter';
};

const determineLuminescence = (entityType: string): string => {
  const patterns = ['Pulsing Blue', 'Static Amber', 'Shifting Spectrum', 'No Luminescence', 'Flickering White'];
  return patterns[Math.floor(Math.random() * patterns.length)];
};

const determineTexture = (physicalForm: string): string => {
  const form = physicalForm.toLowerCase();
  if (form.includes('smooth') || form.includes('glass')) return 'Smooth Glass';
  if (form.includes('rough') || form.includes('stone')) return 'Rough Stone';
  if (form.includes('liquid') || form.includes('fluid')) return 'Flowing Liquid';
  if (form.includes('soft') || form.includes('cloud')) return 'Soft Membrane';
  return 'Variable Texture';
};

const determineMovement = (physicalForm: string): string => {
  const form = physicalForm.toLowerCase();
  if (form.includes('float') || form.includes('hover')) return 'Floating';
  if (form.includes('phase') || form.includes('shift')) return 'Phase-shifting';
  if (form.includes('grow') || form.includes('expand')) return 'Crystalline Growth';
  if (form.includes('flow') || form.includes('liquid')) return 'Fluid Motion';
  return 'Static Form';
};

const determineEnvironmentalInteraction = (environment: string): string => {
  const env = environment.toLowerCase();
  if (env.includes('light') || env.includes('bright')) return 'Absorbs Light';
  if (env.includes('space') || env.includes('void')) return 'Distorts Space';
  if (env.includes('energy') || env.includes('electric')) return 'Emits Radiation';
  if (env.includes('cold') || env.includes('ice')) return 'Freezes Surroundings';
  return 'Neutral Interaction';
};

const determineSensoryEmanations = (communication: string): string => {
  const comm = communication.toLowerCase();
  if (comm.includes('sound') || comm.includes('vibrat')) return 'Harmonic Vibrations';
  if (comm.includes('electric') || comm.includes('magnetic')) return 'Electromagnetic Pulses';
  if (comm.includes('psychic') || comm.includes('mental')) return 'Psychic Resonance';
  if (comm.includes('chemical') || comm.includes('scent')) return 'Chemical Signals';
  return 'Unknown Emanations';
};

const determineStructuralComplexity = (entityType: string): string => {
  const patterns = ['Fractal Patterns', 'Geometric Precision', 'Organic Chaos', 'Crystalline Order', 'Fluid Dynamics'];
  return patterns[Math.floor(Math.random() * patterns.length)];
};
