import { PersonaV2 } from '../../../types/persona-v2';

export interface StateBuilderOptions {
  identity: PersonaV2['identity'];
  cognitive: PersonaV2['cognitive_profile'];
  social: PersonaV2['social_cognition'];
  health: PersonaV2['health_profile'];
  life_context: PersonaV2['life_context'];
  seed: string;
}

export interface StateResult {
  state_hooks: Record<string, Record<string, number | string>>;
  baseline_state: {
    stress: number;
    fatigue: number;
    social_energy: number;
    emotional_volatility: number;
    sexual_tension: number;
    cognitive_load: number;
  };
  trigger_thresholds: {
    stress_trigger: number;
    fatigue_trigger: number;
    social_depletion_trigger: number;
    emotional_spike_trigger: number;
  };
  state_decay_rates: {
    stress_decay: number;
    fatigue_recovery: number;
    social_recharge: number;
    emotional_stabilization: number;
  };
}

export function buildStateProfile(options: StateBuilderOptions): StateResult {
  const { identity, cognitive, social, health, life_context, seed } = options;
  const rng = createSeededRNG(hashSeed(seed));

  // Calculate baseline state values
  const baseline_state = calculateBaselineState(cognitive, health, life_context, identity, rng);
  
  // Build state hooks for dynamic responses
  const state_hooks = buildStateHooks(cognitive, social, health, rng);
  
  // Determine trigger thresholds
  const trigger_thresholds = calculateTriggerThresholds(cognitive, health, rng);
  
  // Calculate decay rates for state recovery
  const state_decay_rates = calculateDecayRates(cognitive, health, rng);

  return {
    state_hooks,
    baseline_state,
    trigger_thresholds,
    state_decay_rates
  };
}

function calculateBaselineState(
  cognitive: PersonaV2['cognitive_profile'],
  health: PersonaV2['health_profile'],
  life_context: PersonaV2['life_context'],
  identity: PersonaV2['identity'],
  rng: () => number
): StateResult['baseline_state'] {
  
  // Stress baseline from neuroticism + life stressors
  const stress_base = cognitive.big_five.neuroticism * 0.6;
  const stress_life_factor = life_context.stressors.length * 0.1;
  const stress = Math.min(0.95, stress_base + stress_life_factor + (rng() - 0.5) * 0.2);
  
  // Fatigue from energy baseline + mental health
  const energy_map = { low: 0.7, medium: 0.4, high: 0.2 };
  const fatigue_base = energy_map[health.energy_baseline];
  const mental_health_penalty = health.mental_health.includes("depression") ? 0.2 : 
                               health.mental_health.includes("anxiety") ? 0.1 : 0;
  const fatigue = Math.min(0.95, fatigue_base + mental_health_penalty + (rng() - 0.5) * 0.15);
  
  // Social energy from extraversion - social anxiety
  const social_energy = Math.max(0.05, 
    cognitive.big_five.extraversion - 
    (health.mental_health.includes("anxiety") ? 0.3 : 0) + 
    (rng() - 0.5) * 0.2
  );
  
  // Emotional volatility from neuroticism + bipolar/mental health
  const volatility_base = cognitive.big_five.neuroticism * 0.7;
  const bipolar_bonus = health.mental_health.includes("bipolar") ? 0.3 : 0;
  const emotional_volatility = Math.min(0.95, volatility_base + bipolar_bonus + (rng() - 0.5) * 0.15);
  
  // Sexual tension baseline (age and relationship dependent)
  const age_factor = identity.age < 30 ? 0.6 : identity.age < 50 ? 0.4 : 0.2;
  const relationship_factor = identity.relationship_status === "single" ? 0.3 : 
                             identity.relationship_status === "dating" ? 0.4 : 0.2;
  const sexual_tension = Math.max(0.05, age_factor + relationship_factor + (rng() - 0.5) * 0.3);
  
  // Cognitive load from conscientiousness + work stress
  const cognitive_load = Math.min(0.9, 
    cognitive.big_five.conscientiousness * 0.5 + 
    (life_context.stressors.includes("work") ? 0.2 : 0) + 
    (rng() - 0.5) * 0.2
  );

  return {
    stress: Math.max(0.05, Math.min(0.95, stress)),
    fatigue: Math.max(0.05, Math.min(0.95, fatigue)),
    social_energy: Math.max(0.05, Math.min(0.95, social_energy)),
    emotional_volatility: Math.max(0.05, Math.min(0.95, emotional_volatility)),
    sexual_tension: Math.max(0.05, Math.min(0.95, sexual_tension)),
    cognitive_load: Math.max(0.05, Math.min(0.95, cognitive_load))
  };
}

function buildStateHooks(
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  health: PersonaV2['health_profile'],
  rng: () => number
): Record<string, Record<string, number | string>> {
  
  const hooks: Record<string, Record<string, number | string>> = {};
  
  // High stress hooks
  hooks["stress>0.6"] = {
    hedge_rate: "+0.15",
    sentence_length_bias: "shorter",
    interjection_rate: "+0.1",
    discourse_marker_rate: "+0.05"
  };
  
  hooks["stress>0.8"] = {
    hedge_rate: "+0.25",
    profanity_rate: "+0.05",
    sentence_fragment_rate: "+0.1",
    emotional_intensity: "+0.2"
  };
  
  // High fatigue hooks
  hooks["fatigue>0.7"] = {
    sentence_length_bias: "much_shorter",
    complexity_reduction: "-1",
    list_reduction: "-0.5",
    discourse_marker_rate: "-0.1"
  };
  
  // Low social energy hooks
  hooks["social_energy<0.3"] = {
    hedge_rate: "+0.1",
    social_validation_seeking: "+0.2",
    conflict_avoidance: "+0.3",
    response_length: "shorter"
  };
  
  // High emotional volatility hooks
  hooks["emotional_volatility>0.7"] = {
    emotional_language_rate: "+0.3",
    exclamation_rate: "+0.15",
    contradiction_likelihood: "+0.1",
    topic_jumping: "+0.2"
  };
  
  // Sexual tension hooks (privacy-aware)
  hooks["sexual_tension>0.6"] = {
    innuendo_detection: "+0.1",
    flirtation_responsiveness: "+0.15",
    sexual_topic_comfort: "+0.1"
  };
  
  hooks["sexual_tension>0.8"] = {
    sexual_topic_comfort: "+0.2",
    innuendo_generation: "+0.05",
    romantic_subtext: "+0.1"
  };
  
  // Cognitive load hooks
  hooks["cognitive_load>0.7"] = {
    processing_delay_simulation: "+0.1",
    simplification_bias: "+0.2",
    detail_reduction: "+0.15",
    focus_narrowing: "+0.1"
  };
  
  // Combination hooks for complex states
  hooks["stress>0.6&&fatigue>0.6"] = {
    irritability: "+0.3",
    patience_reduction: "+0.2",
    social_withdrawal: "+0.15"
  };
  
  hooks["social_energy<0.3&&emotional_volatility>0.6"] = {
    emotional_dumping: "+0.2",
    oversharing_risk: "+0.15",
    boundary_confusion: "+0.1"
  };

  // Add personality-specific modifiers
  if (cognitive.big_five.neuroticism > 0.7) {
    hooks["stress>0.4"] = {
      ...hooks["stress>0.4"] || {},
      catastrophizing: "+0.2",
      worst_case_thinking: "+0.15"
    };
  }
  
  if (cognitive.big_five.agreeableness > 0.7) {
    hooks["stress>0.5"] = {
      ...hooks["stress>0.5"] || {},
      people_pleasing: "+0.2",
      conflict_avoidance: "+0.25"
    };
  }

  return hooks;
}

function calculateTriggerThresholds(
  cognitive: PersonaV2['cognitive_profile'],
  health: PersonaV2['health_profile'],
  rng: () => number
): StateResult['trigger_thresholds'] {
  
  // Stress trigger based on neuroticism (lower = more sensitive)
  const stress_trigger = Math.max(0.3, 0.8 - cognitive.big_five.neuroticism + (rng() - 0.5) * 0.2);
  
  // Fatigue trigger based on energy baseline
  const energy_map = { low: 0.4, medium: 0.6, high: 0.8 };
  const fatigue_trigger = energy_map[health.energy_baseline] + (rng() - 0.5) * 0.15;
  
  // Social depletion based on extraversion
  const social_depletion_trigger = Math.max(0.2, 
    0.7 - cognitive.big_five.extraversion + (rng() - 0.5) * 0.2
  );
  
  // Emotional spike trigger based on neuroticism + mental health
  const mental_health_sensitivity = health.mental_health.includes("bipolar") ? -0.2 : 
                                   health.mental_health.includes("anxiety") ? -0.1 : 0;
  const emotional_spike_trigger = Math.max(0.3, 
    0.7 - cognitive.big_five.neuroticism + mental_health_sensitivity + (rng() - 0.5) * 0.15
  );

  return {
    stress_trigger: Math.max(0.2, Math.min(0.9, stress_trigger)),
    fatigue_trigger: Math.max(0.2, Math.min(0.9, fatigue_trigger)),
    social_depletion_trigger: Math.max(0.1, Math.min(0.8, social_depletion_trigger)),
    emotional_spike_trigger: Math.max(0.2, Math.min(0.9, emotional_spike_trigger))
  };
}

function calculateDecayRates(
  cognitive: PersonaV2['cognitive_profile'],
  health: PersonaV2['health_profile'],
  rng: () => number
): StateResult['state_decay_rates'] {
  
  // Stress decay based on conscientiousness (coping) and openness (adaptability)
  const stress_decay = Math.max(0.05, 
    (cognitive.big_five.conscientiousness * 0.4 + cognitive.big_five.openness * 0.3) + 
    (rng() - 0.5) * 0.1
  );
  
  // Fatigue recovery based on energy baseline and physical health
  const energy_map = { low: 0.3, medium: 0.5, high: 0.7 };
  const fatigue_recovery = energy_map[health.energy_baseline] * 
    (health.physical_health.includes("chronic_illness") ? 0.7 : 1.0) + 
    (rng() - 0.5) * 0.1;
  
  // Social recharge based on extraversion
  const social_recharge = Math.max(0.1, 
    cognitive.big_five.extraversion * 0.6 + (rng() - 0.5) * 0.15
  );
  
  // Emotional stabilization based on agreeableness and conscientiousness
  const emotional_stabilization = Math.max(0.05, 
    (cognitive.big_five.agreeableness * 0.3 + cognitive.big_five.conscientiousness * 0.4) + 
    (rng() - 0.5) * 0.1
  );

  return {
    stress_decay: Math.max(0.05, Math.min(0.8, stress_decay)),
    fatigue_recovery: Math.max(0.05, Math.min(0.8, fatigue_recovery)),
    social_recharge: Math.max(0.1, Math.min(0.9, social_recharge)),
    emotional_stabilization: Math.max(0.05, Math.min(0.8, emotional_stabilization))
  };
}

// Utility functions
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function createSeededRNG(seed: number): () => number {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
    return state / Math.pow(2, 32);
  };
}