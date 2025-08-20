// PersonaV3 type definitions

export interface PersonaV3Location {
  city: string;
  region: string;
  country: string;
}

export interface PersonaV3CulturalDimensions {
  power_distance: number;
  individualism_vs_collectivism: number;
  masculinity_vs_femininity: number;
  uncertainty_avoidance: number;
  long_term_orientation: number;
  indulgence_vs_restraint: number;
}

export interface PersonaV3SocioeconomicContext {
  income_level: string;
  education_level: string;
  social_class_identity: string;
  political_affiliation: string;
  religious_affiliation: string;
  religious_practice_level: "low" | "medium" | "high";
  cultural_background: string;
  cultural_dimensions: PersonaV3CulturalDimensions;
}

export interface PersonaV3Identity {
  age: number;
  gender: string;
  pronouns: string;
  ethnicity: string;
  nationality: string;
  occupation: string;
  relationship_status: string;
  dependents: number;
  location: PersonaV3Location;
  socioeconomic_context: PersonaV3SocioeconomicContext;
}

export interface PersonaV3LifeContext {
  supports: string[];
  stressors: string[];
  daily_routine: string;
  current_situation: string;
  background_narrative: string;
  lifestyle: string;
}

export interface PersonaV3KnowledgeDomains {
  arts: number;
  health: number;
  sports: number;
  finance: number;
  history: number;
  science: number;
  business: number;
  politics: number;
  technology: number;
  entertainment: number;
}

export interface PersonaV3KnowledgeProfile {
  general_knowledge_level: "low" | "medium" | "high";
  tech_literacy: "low" | "medium" | "high";
  domains_of_expertise: string[];
  knowledge_domains: PersonaV3KnowledgeDomains;
}

export interface PersonaV3BigFive {
  openness: number;
  neuroticism: number;
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
}

export interface PersonaV3ExtendedTraits {
  empathy: number;
  self_efficacy: number;
  cognitive_flexibility: number;
  impulse_control: number;
  attention_pattern: number;
  manipulativeness: number;
  need_for_cognitive_closure: number;
  institutional_trust: number;
}

export interface PersonaV3Intelligence {
  type: ("analytical" | "creative" | "practical" | "emotional")[];
  level: "low" | "medium" | "high";
}

export interface PersonaV3BehavioralEconomics {
  present_bias: number;
  loss_aversion: number;
  overconfidence: number;
  risk_sensitivity: number;
  scarcity_sensitivity: number;
}

export interface PersonaV3MoralFoundations {
  care_harm: number;
  fairness_cheating: number;
  loyalty_betrayal: number;
  authority_subversion: number;
  sanctity_degradation: number;
  liberty_oppression: number;
}

export interface PersonaV3SocialIdentity {
  identity_strength: number;
  ingroup_bias_tendency: number;
  outgroup_bias_tendency: number;
  cultural_intelligence: number;
  system_justification: number;
}

export interface PersonaV3PoliticalOrientation {
  authoritarian_libertarian: number;
  economic: number;
  cultural_progressive_conservative: number;
}

export interface PersonaV3CognitiveProfile {
  big_five: PersonaV3BigFive;
  extended_traits: PersonaV3ExtendedTraits;
  intelligence: PersonaV3Intelligence;
  decision_style: "logical" | "intuitive" | "mixed";
  behavioral_economics: PersonaV3BehavioralEconomics;
  moral_foundations: PersonaV3MoralFoundations;
  social_identity: PersonaV3SocialIdentity;
  political_orientation: PersonaV3PoliticalOrientation;
  worldview_summary: string;
}

export interface PersonaV3MemoryPersistence {
  long_term: number;
  short_term: number;
}

export interface PersonaV3LongTermEvent {
  event: string;
  valence: "positive" | "negative";
  timestamp: string;
  recall_cues: string[];
  impact_on_behavior: string;
}

export interface PersonaV3Memory {
  persistence: PersonaV3MemoryPersistence;
  long_term_events: PersonaV3LongTermEvent[];
  short_term_slots: number;
}

export interface PersonaV3CurrentState {
  fatigue: number;
  acute_stress: number;
  mood_valence: number;
  social_safety: number;
  time_pressure: number;
}

export interface PersonaV3StateRule {
  when: Record<string, string>;
  shift: Record<string, Record<string, Record<string, string>>>;
}

export interface PersonaV3StateModifiers {
  current_state: PersonaV3CurrentState;
  state_to_shift_rules: PersonaV3StateRule[];
}

export interface PersonaV3BaseVoice {
  formality: string;
  verbosity: string;
  directness: string;
  politeness: string;
}

export interface PersonaV3SyntaxRhythm {
  complexity: string;
  disfluencies: string[];
  signature_phrases: string[];
  avg_sentence_tokens: {
    baseline_max: number;
    baseline_min: number;
  };
}

export interface PersonaV3AntiModeCollapse {
  forbidden_frames: string[];
  must_include_one_of: Record<string, string[]>;
}

export interface PersonaV3LexicalPreferences {
  hedges: string[];
  modal_verbs: string[];
  affect_words: {
    negative_bias: number;
    positive_bias: number;
  };
}

export interface PersonaV3LinguisticStyle {
  base_voice: PersonaV3BaseVoice;
  syntax_and_rhythm: PersonaV3SyntaxRhythm;
  anti_mode_collapse: PersonaV3AntiModeCollapse;
  lexical_preferences: PersonaV3LexicalPreferences;
  response_shapes_by_intent: Record<string, string[]>;
}

export interface PersonaV3GroupBehavior {
  assertiveness: "high" | "medium" | "low";
  interruption_tolerance: string;
  self_disclosure_rate: string;
}

export interface PersonaV3SocialCognition {
  empathy: "high" | "medium" | "low";
  theory_of_mind: string;
  conflict_orientation: string;
}

export interface PersonaV3SexualityProfile {
  orientation: string;
  expression: "private" | "open";
  flirtatiousness: "low" | "medium" | "high";
  libido_level: "low" | "medium" | "high";
  relationship_norms: string;
}

export interface PersonaV3EmotionalTriggers {
  positive: string[];
  negative: string[];
  explosive: string[];
}

export interface PersonaV3StyleWeights {
  cognition: number;
  knowledge: number;
  linguistics: number;
}

export interface PersonaV3TokenBudgets {
  max: number;
  min: number;
}

export interface PersonaV3VariabilityProfile {
  turn_to_turn: number;
  session_to_session: number;
}

export interface PersonaV3RuntimeControls {
  style_weights: PersonaV3StyleWeights;
  token_budgets: PersonaV3TokenBudgets;
  variability_profile: PersonaV3VariabilityProfile;
}

export interface PersonaV3InterviewResponse {
  question: string;
  answer: string;
}

export interface PersonaV3InterviewSection {
  section_title: string;
  responses: PersonaV3InterviewResponse[];
}

export interface PersonaV3 {
  persona_id: string;
  id: string;
  name: string;
  description?: string;
  version: "3.0";
  created_at: string;
  identity: PersonaV3Identity;
  life_context: PersonaV3LifeContext;
  knowledge_profile: PersonaV3KnowledgeProfile;
  cognitive_profile: PersonaV3CognitiveProfile;
  memory: PersonaV3Memory;
  state_modifiers: PersonaV3StateModifiers;
  linguistic_style: PersonaV3LinguisticStyle;
  group_behavior: PersonaV3GroupBehavior;
  social_cognition: PersonaV3SocialCognition;
  sexuality_profile: PersonaV3SexualityProfile;
  emotional_triggers: PersonaV3EmotionalTriggers;
  runtime_controls: PersonaV3RuntimeControls;
  interview_sections: PersonaV3InterviewSection[];
}