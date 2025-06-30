
// Non-humanoid character trait definitions - completely separate from persona types
export interface NonHumanoidCommunicationStyle {
  modality: string;
  linguistic_structure: string;
  expression_register: string;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidPhysicalManifestationTraits {
  primary_form: string; // e.g., "Crystalline Matrix", "Energy Field", "Gaseous Cloud"
  scale_category: string; // e.g., "Microscopic", "Human-scale", "Massive", "Planetary"
  material_composition: string; // e.g., "Pure Energy", "Living Crystal", "Metallic Liquid"
  dimensional_properties: string; // e.g., "3D Stable", "4D Shifting", "Non-Euclidean"
  luminescence_pattern: string; // e.g., "Pulsing Blue", "Static Amber", "Shifting Spectrum"
  texture_quality: string; // e.g., "Smooth Glass", "Rough Stone", "Flowing Liquid"
  movement_characteristics: string; // e.g., "Floating", "Phase-shifting", "Crystalline Growth"
  environmental_interaction: string; // e.g., "Absorbs Light", "Distorts Space", "Emits Radiation"
  sensory_emanations: string; // e.g., "Harmonic Vibrations", "Electromagnetic Pulses", "Psychic Resonance"
  structural_complexity: string; // e.g., "Fractal Patterns", "Geometric Precision", "Organic Chaos"
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidCoreMotives {
  pattern_completion?: number;
  influence_expansion?: number;
  resource_stability?: number;
  information_accumulation?: number;
  cosmological_balance?: number;
  self_replication?: number;
  obedience_to_ancestral_code?: number;
  loyalty_to_core_entity?: number;
  emotional_mimicry?: number;
  territorial_stability?: number;
  subordinate_protection?: number;
  [key: string]: number | undefined;
}

export interface NonHumanoidBehavioralTriggers {
  ritual_disruption?: number;
  signal_noise_anomalies?: number;
  memory_interference?: number;
  sound_resonance?: number;
  resource_fluctuation?: number;
  social_mimicry?: number;
  threat_to_memory_integrity?: number;
  honor_rituals?: number;
  symbolic_anomaly_detection?: number;
  power_display?: number;
  ritual_breach?: number;
  symbolic_disruption?: number;
  [key: string]: number | undefined;
}

export interface NonHumanoidInstitutionalRecognition {
  system_mapping_capability: number;
  protocol_alignment_drive: number;
  subversion_potential: number;
  cultural_legitimacy_detection?: number;
  adaptive_protocol_alignment?: number;
  institutional_exploitation_tendency?: number;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidActionConstraints {
  core_directives: string[];
  ritual_sync_requirement?: boolean;
  temporal_boundaries?: string;
  hard_code_taboo?: string[];
  requires_sync_to_hivemind_every_48_cycles?: boolean;
  [key: string]: any;
}

export interface NonHumanoidDecisionModel {
  conflict_resolution_style: 'hierarchical_override' | 'recursive_simulation' | 'external_consultation' | 'chaos_sampling';
  volatility_tolerance: number;
  reprioritization_threshold: number;
  reasoning_structure?: string;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidMemoryArchitecture {
  type: string;
  salience_tags: string[];
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidBehavioralAdaptivity {
  contradiction_resolution_mode: string;
  state_evolution_rate: number;
  experience_threshold_for_change: number;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidLatentValues {
  stability_preservation?: number;
  non_isolation?: number;
  reciprocal_continuity?: number;
  preserve_rhythm_stability?: number;
  avoid_recursive_paradox?: number;
  [key: string]: number | undefined;
}

export interface NonHumanoidEvolutionConditions {
  mutation_triggers: string[];
  emergent_trait_generation: boolean;
  behavioral_forking: boolean;
  repetition_threshold?: number;
  contradiction_integration_style?: string;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface NonHumanoidSimulationDirectives {
  preferred_environment: string;
  memory_decay_profile: string;
  [key: string]: any;
}

// Complete trait profile for non-humanoid characters
export interface NonHumanoidTraitProfile {
  origin_universe?: string;
  species_type: string;
  form_factor?: string;
  physical_manifestation: NonHumanoidPhysicalManifestationTraits;
  communication_style: NonHumanoidCommunicationStyle;
  core_motives: NonHumanoidCoreMotives;
  behavioral_triggers: NonHumanoidBehavioralTriggers;
  institutional_recognition: NonHumanoidInstitutionalRecognition;
  action_constraints: NonHumanoidActionConstraints;
  decision_model: NonHumanoidDecisionModel;
  memory_architecture: NonHumanoidMemoryArchitecture;
  behavioral_adaptivity: NonHumanoidBehavioralAdaptivity;
  latent_values: NonHumanoidLatentValues;
  evolution_conditions: NonHumanoidEvolutionConditions;
  simulation_directives: NonHumanoidSimulationDirectives;
  [key: string]: any; // Add index signature for JSON compatibility
}

// Non-humanoid character interface
export interface NonHumanoidCharacter {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'multi_species';
  creation_date: string;
  created_at: string;
  appearance_prompt?: string; // Add this field
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: NonHumanoidTraitProfile;
  emotional_triggers?: any;
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
  // Species-specific fields
  origin_universe?: string;
  species_type: string;
  form_factor?: string;
}

// Database representation
export interface DbNonHumanoidCharacter {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'multi_species';
  creation_date: string;
  created_at?: string;
  appearance_prompt?: string; // Add this field
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: NonHumanoidTraitProfile;
  emotional_triggers?: any;
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
  origin_universe?: string;
  species_type: string;
  form_factor?: string;
}
