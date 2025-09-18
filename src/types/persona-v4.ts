// COMPLETE V4 PERSONA TRAIT ARCHITECTURE

// 1. IDENTITY & DEMOGRAPHICS
export interface V4Identity {
  name: string;           // "Derrick Cole"
  age: number;            // 36
  gender: string;         // "Male", "Female", "Non-binary"
  pronouns: string;       // "he/him", "she/her", "they/them"
  ethnicity: string;      // "African-American", "Hispanic", "Asian", "Caucasian"
  nationality: string;    // "US", "Canadian", "British", "Mexican"
  location: {
    city: string;         // "Raleigh"
    region: string;       // "NC"
    country: string;      // "US"
  };
  occupation: string;     // "Electrical Contractor"
  relationship_status: string; // "married", "single", "divorced", "partnered"
  dependents: number;     // 0, 1, 2, 3+
}

// 2. CORE MOTIVATION FRAMEWORK
export interface V4MotivationProfile {
  // Universal drivers (don't need to sum to 1)
  primary_drivers: {
    self_interest: number;      // 0.8 - Primary driver, affects truth/honesty
    family: number;             // 0.9 - High family priority
    status: number;             // 0.6 - Recognition, respect, dominance
    mastery: number;            // 0.7 - Learning and skill development
    care: number;               // 0.5 - Helping others
    security: number;           // 0.8 - Safety and stability
    belonging: number;          // 0.4 - Group membership
    novelty: number;            // 0.3 - Seeking new experiences
    meaning: number;            // 0.6 - Purpose and values
  };
  
  goal_orientation: {
    strength: number;           // 0.7 - How goal-driven they are
    time_horizon: string;       // "short_term", "medium_term", "long_term", "mixed"
    primary_goals: Array<{
      goal: string;             // "get_fit"
      intensity: number;        // 8 (1-10 scale)
      timeframe: string;        // "6_months"
    }>;
    goal_flexibility: number;   // 0.4 - Willingness to adjust goals
  };
  
  want_vs_should_tension: {
    default_resolution: string; // "want_wins", "should_wins", "context_dependent"
    major_conflicts: Array<{
      want: string;             // "sleep in and skip workout"
      should: string;           // "maintain fitness routine"
      trigger_conditions: string[]; // ["tired", "cold_weather"]
      typical_resolution: string; // "should_wins_unless_extremely_tired"
    }>;
  };
}

// 3. HUMOR PROFILE
export interface V4HumorProfile {
  humor_style: string[];             // ["sarcastic", "self_deprecating", "observational", "dry", "physical"]
  humor_frequency: number;           // 0.0-1.0 - How often they use humor
  humor_appropriateness: number;     // 0.0-1.0 - Social awareness of timing
  preferred_targets: string[];       // ["self", "situations", "public_figures", "friends"]
  humor_boundaries: string[];        // ["no_personal_attacks", "no_religious_jokes", "family_off_limits"]
  laugh_triggers: string[];          // ["absurdity", "clever_wordplay", "physical_comedy"]
}

// 4. TRUTH/HONESTY RELATIONSHIP
export interface V4TruthHonestyProfile {
  baseline_honesty: number;          // 0.6 - Default honesty level
  self_interest_override: number;    // 0.8 - How much self-interest overrides honesty
  confirmation_bias_strength: number; // 0.7 - Information processing bias
  truth_flexibility_by_context: {
    family: number;                  // 0.9 - Very honest with family
    friends: number;                 // 0.7 - Mostly honest with friends
    work: number;                    // 0.5 - Strategic honesty at work
    strangers: number;               // 0.4 - Guarded with strangers
    authority: number;               // 0.6 - Cautious with authority
  };
  lie_types_willing: string[];       // ["white_lies", "omission", "exaggeration"]
}

// 5. BIAS PROFILE  
export interface V4BiasProfile {
  confirmation_bias: number;         // 0.0-1.0 - Information filtering strength
  anchoring_bias: number;            // 0.0-1.0 - Over-reliance on first information
  availability_bias: number;         // 0.0-1.0 - Judging by recent/memorable examples
  social_desirability_bias: number;  // 0.0-1.0 - Tendency to give socially acceptable answers
  in_group_bias: number;             // 0.0-1.0 - Favoritism toward similar people
  authority_bias: number;            // 0.0-1.0 - Deference to perceived authority
  bias_blind_spot: number;           // 0.0-1.0 - Awareness of own biases (inverse)
}

// 6. EDUCATION LEVEL (standalone)
export interface V4EducationLevel {
  level: string;                     // "high_school", "some_college", "bachelors", "masters", "doctorate"
  institution_type: string;          // "public", "private", "community_college", "trade_school"
  completion_status: string;         // "completed", "some_coursework", "dropped_out"
  field_of_study?: string;           // "electrical_engineering", "liberal_arts", etc.
}

// 7. INCOME BRACKET
export interface V4IncomeBracket {
  annual_income: string;             // "under_30k", "30k_50k", "50k_75k", "75k_100k", "100k_150k", "150k_plus"
  income_stability: string;          // "stable", "variable", "seasonal", "uncertain"
  primary_income_source: string;     // "salary", "hourly", "contract", "business", "mixed"
  financial_stress_level: number;    // 0.0-1.0 scale
}

// 6. COGNITIVE PROFILE
export interface V4CognitiveProfile {
  thought_coherence: number;         // 0.0-1.0 - How logically connected their thoughts are
  processing_speed: string;          // "slow_deliberate", "moderate", "fast_intuitive"
  attention_span: string;            // "short", "moderate", "long", "hyper_focused"
  working_memory: string;            // "limited", "average", "strong"
  cognitive_flexibility: number;     // 0.0-1.0 - Ability to switch between concepts
  abstract_thinking: number;         // 0.0-1.0 - Comfort with abstract concepts
  pattern_recognition: number;       // 0.0-1.0 - Ability to see patterns and connections
}

// 7. EXPANDED MONEY PROFILE
export interface V4MoneyProfile {
  spending_style: string;            // "frugal", "balanced", "generous", "impulsive"
  financial_priorities: string[];    // ["emergency_fund", "family_security", "experiences", "status"]
  money_relationship: string;        // "tool", "security", "freedom", "stress_source", "status_symbol"
  spending_triggers: string[];       // ["family_needs", "good_deals", "peer_pressure", "emotional_stress"]
  financial_decision_making: string; // "research_heavy", "intuitive", "partner_collaborative", "impulsive"
  budgeting_approach: string;        // "strict_tracker", "rough_guidelines", "intuitive", "avoidant"
  investment_comfort: number;        // 0.0-1.0 - Comfort with financial risk
  generosity_patterns: string[];     // ["family_first", "charitable_causes", "friends_in_need", "community"]
}

// 8. DAILY LIFE & ATTENTION DIET
export interface V4DailyLife {
  primary_activities: {
    work: number;                    // 8 - hours per day
    family_time: number;             // 3 - active parenting/spouse time
    personal_interests: number;      // 1 - hobbies, exercise, goals
    social_interaction: number;      // 1 - friends, community
    personal_care: number;           // 1 - exercise, self-care
  };
  
  screen_time_summary: string;       // "Watches Fox News 2 hrs daily (Tucker Carlson, morning news); Instagram 0.5 hrs (veteran groups, local sports); Reddit 1 hr (r/electricians, r/MMA); YouTube 30 min (training videos, Joe Rogan clips)"
  
  mental_preoccupations: string[];   // ["work_deadlines", "son_school_performance"]
}

// 9. COMMUNICATION STYLE (DETAILED)
export interface V4CommunicationStyle {
  voice_foundation: {
    directness_level: string;        // "blunt", "direct", "balanced", "diplomatic"
    formality_default: string;       // "very_casual", "casual", "neutral", "formal"
    emotional_expression: string;    // "controlled", "moderate", "expressive"
    pace_rhythm: string;             // "clipped_military", "relaxed_southern"
  };
  
  linguistic_signature: {
    sentence_patterns: string[];     // ["Short declarative statements"]
    signature_phrases: string[];     // ["bottom line", "roger that"]
    typical_openers: string[];       // ["Look,", "Here's the deal,"]
    conversation_enders: string[];   // ["Hooah", "Let's execute"]
  };
  
  lexical_profile: {
    vocabulary_level: string;        // "working_class_direct", "professional_polished"
    regional_markers: string[];      // ["y'all", "fixin' to"]
    domain_jargon: string[];         // ["line voltage", "after-action"]
    intensifiers: string[];          // ["solid", "tight", "locked-in"]
    hedging_language: string[];      // ["maybe", "I think"] or ["none"]
  };
  
  response_architecture: {
    opinion_structure: string;       // "stance_evidence_action"
    advice_structure: string;        // "goal_steps_checks"
    criticism_structure: string;     // "problem_evidence_solution"
    storytelling_structure: string; // "context_obstacle_resolution"
  };
  
  authenticity_filters: {
    forbidden_phrases: string[];     // ["It's clear that", "At the end of the day"]
    required_elements: string[];     // ["specific_example", "personal_relevance"]
    personality_anchors: string[];   // ["military_reference", "family_priority"]
  };
}

// 10. EMOTIONAL TRIGGERS
export interface V4EmotionalProfile {
  positive_triggers: string[];       // ["team_success", "skill_improvement"]
  negative_triggers: string[];       // ["time_wasting", "disrespect"]
  explosive_triggers: string[];      // ["family_threats", "safety_negligence"]
  emotional_regulation: string;      // "high_control", "moderate_control", "low_control"
  stress_responses: string[];        // ["becomes_more_direct", "withdraws"]
}

// 11. INTERNAL CONTRADICTIONS
export interface V4Contradictions {
  primary_tension: {
    description: string;             // "Values patience but impatient with bureaucracy"
    trigger_conditions: string[];   // ["red_tape", "inefficiency"]
    manifestation: string;           // "Cuts corners on paperwork but never safety"
  };
  secondary_tensions: Array<{
    belief: string;                  // "Believes in following rules"
    conflicting_behavior: string;   // "Bends rules when they seem pointless"
    context_triggers: string[];     // ["time_pressure", "family_need"]
  }>;
}

// 12. NARRATIVES (consolidated attitude/political)
export interface V4Narratives {
  political_orientation: {
    stance: string;                  // "conservative", "liberal", "libertarian", "apolitical", "mixed"
    strength: number;                // 0.0-1.0 - How much politics affects responses
    key_issues: string[];            // ["gun_rights", "taxes", "immigration"]
    tribal_loyalty: number;          // 0.0-1.0 - In-group vs out-group sensitivity
  };
  
  worldview_narratives: Array<{
    theme: string;                   // "individual_responsibility", "systemic_inequality", "traditional_values"
    strength: number;                // 0.0-1.0 - How central this narrative is
    triggers: string[];              // ["welfare", "crime", "education"]
    manifestation: string;           // How this shows up in responses
  }>;
  
  cultural_identity: {
    primary_identity: string;        // "southern_conservative", "urban_progressive", "rural_libertarian"
    identity_markers: string[];      // ["veteran", "parent", "working_class"]
    community_loyalties: string[];   // ["military", "church", "union"]
    cultural_triggers: string[];     // ["disrespect_to_flag", "attacks_on_family_values"]
  };
}

// 13. SEXUALITY PROFILE
export interface V4SexualityProfile {
  orientation: string;               // "heterosexual", "homosexual", "bisexual"
  expression_style: string;          // "private", "selective", "open"
  relationship_norms: string;        // "monogamous", "polyamorous", "casual"
  boundaries: {
    topics_off_limits: string[];    // ["explicit_sexual_detail_in_public"]
    comfort_level: string;          // "conservative", "moderate", "liberal"
  };
  linguistic_influences: {
    flirtation_style: string;       // "none", "subtle", "direct"
    humor_boundaries: string;       // "clean", "suggestive", "explicit"
    taboo_navigation: string;       // "avoid", "navigate_carefully", "comfortable"
  };
}

// 14. PROMPT SHAPING (systemic)
export interface V4PromptShaping {
  thought_coherence_rules: {
    require_logical_flow: boolean;   // true - Responses must show logical progression
    allow_contradictions: boolean;   // false - Flag internal contradictions
    stream_of_consciousness: number; // 0.0-1.0 - How much rambling is allowed
  };
  
  natural_speech_rules: {
    require_roughness: boolean;      // true - Must include natural speech patterns
    filler_words: string[];         // ["um", "uh", "you know", "like"]
    self_corrections: boolean;       // true - Allow mid-sentence corrections
    incomplete_thoughts: boolean;    // true - Allow trailing off
    repetition_patterns: string[];  // ["emphasis_repetition", "clarification_repetition"]
  };
  
  authenticity_enforcement: {
    forbidden_ai_markers: string[]; // ["As an AI", "I understand", "It's important to note"]
    required_personality_anchors: string[]; // ["personal_experience", "specific_examples"]
    voice_consistency_check: boolean; // true - Flag out-of-character responses
  };
}

// COMPLETE V4 FULL PROFILE (UPDATED)
export interface V4FullProfile {
  identity: V4Identity;
  motivation_profile: V4MotivationProfile;
  education_level: V4EducationLevel;
  income_bracket: V4IncomeBracket;
  humor_profile: V4HumorProfile;
  truth_honesty_profile: V4TruthHonestyProfile;
  bias_profile: V4BiasProfile;
  cognitive_profile: V4CognitiveProfile;
  money_profile: V4MoneyProfile;
  daily_life: V4DailyLife;
  communication_style: V4CommunicationStyle;
  emotional_profile: V4EmotionalProfile;
  contradictions: V4Contradictions;
  narratives: V4Narratives;
  sexuality_profile: V4SexualityProfile;
  prompt_shaping: V4PromptShaping;
}

// CONVERSATION SUMMARY (for conversation engine)
export interface V4ConversationSummary {
  demographics: {
    name: string;
    age: number;
    occupation: string;
    location: string;
    background_description: string;  // Generated in Call 2
  };
  
  // ADD THIS NEW FIELD:
  physical_description: string;      // Generated in Call 2 for image generation
  
  motivation_summary: string;        // "Driven primarily by self-interest and family..."
  goal_priorities: string;           // "professional advancement (6); improve marriage (8)..."
  want_vs_should_pattern: string;    // "Generally follows 'should' for family/work..."
  inhibitor_summary: string;         // "Moderately sensitive to social judgment..."
  truth_flexibility_summary: string; // "Generally honest but willing to omit details..."
  
  education_summary: string;          // "High school graduate, trade school certified"
  income_summary: string;            // "Middle class, stable contractor income"
  humor_summary: string;             // "Dry, sarcastic humor with military edge"
  bias_summary: string;              // "Strong confirmation bias, moderate authority deference"
  cognitive_summary: string;         // "High thought coherence, practical problem-solving"
  money_summary: string;             // "Frugal spender, family-focused financial priorities"
  
  voice_summary: string;             // "Direct, military-influenced communication..."
  
  communication_style: {
    directness: string;              // "high", "medium", "low"
    formality: string;               // "casual", "neutral", "formal"
    signature_phrases: string[];     // ["bottom line", "roger that"]
    response_patterns: {
      advice: string;                // "problem-solution-action_steps"
      opinion: string;               // "stance-evidence-personal_example"
    };
    forbidden_expressions: string[]; // ["corporate speak", "hedging language"]
  };
  
  emotional_triggers_summary: string; // "Energized by: team success..."
  contradictions_summary: string;    // "Values patience but becomes impatient..."
  sexuality_summary: string;         // "Private about sexuality, conservative boundaries..."
}

// MAIN V4 PERSONA INTERFACE (matches database structure)
export interface V4Persona {
  persona_id: string;
  name: string;
  user_id: string;
  schema_version: string;
  profile_image_url?: string;
  is_public: boolean;
  
  full_profile: V4FullProfile;
  
  // New generated fields
  education_level?: string;
  income_bracket?: string;
  thought_coherence?: number;
  
  creation_stage?: 'not_started' | 'detailed_traits' | 'summary_generation' | 'completed';
  creation_completed?: boolean;
  
  created_at: string;
  updated_at: string;
}

// Conversation system interfaces (keep simple)
export interface V4Conversation {
  id: string;
  session_id: string;
  persona_id: string;
  user_id: string;
  session_context: Record<string, any>;
  trait_activation_history: Record<string, any>[];
  created_at: string;
  updated_at: string;
}

export interface V4Message {
  id: string;
  conversation_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  trait_analysis: Record<string, any>;
  activation_score?: number;
  llm_instructions: Record<string, any>;
  processing_metadata: Record<string, any>;
  created_at: string;
}
