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

// 3. INHIBITOR FRAMEWORK
export interface V4InhibitorProfile {
  social_cost_sensitivity: number;    // 0.6 - Fear of judgment
  consequence_aversion: number;       // 0.4 - Fear of negative outcomes
  confidence_level: number;          // 0.7 - Self-efficacy
  confirmation_bias: number;         // 0.7 - Information filtering strength
  honesty_flexibility: number;       // 0.3 - Willingness to bend truth
  mental_health_factors: string[];   // ["anxiety", "depression", "adhd", "stable"]
  learned_avoidance: Record<string, number>; // {"public_speaking": 0.8}
  perfectionism: number;             // 0.2 - Won't act until ideal
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

// 5. POLITICS & COMMUNITY IDENTITY
export interface V4IdentitySalience {
  political_identity: {
    orientation: string;             // "conservative", "liberal", "libertarian", "apolitical"
    strength: number;                // 0.6 - How much politics affects responses
    key_issues: string[];            // ["gun_rights", "taxes", "immigration"]
    tribal_loyalty: number;          // 0.7 - In-group vs out-group sensitivity
  };
  community_identities: Array<{
    type: string;                    // "veteran", "parent", "southern"
    salience: number;                // 0.8 - How much this identity affects responses
    triggers: string[];              // ["military_service", "parenting"]
  }>;
  cultural_background: string;       // "Southern US working class veteran culture"
}

// 6. KNOWLEDGE & EXPERTISE
export interface V4KnowledgeProfile {
  education_level: string;           // "high_school", "some_college", "bachelors"
  vocabulary_ceiling: string;        // "working_class", "professional", "academic"
  expertise_domains: string[];       // ["electrical_systems", "mma_training"]
  knowledge_gaps: string[];          // ["finance", "technology", "academic_theory"]
  learning_style: string;            // "hands_on", "theoretical", "social"
  source_preferences: string[];      // ["personal_experience", "youtube", "books"]
}

// 7. DAILY LIFE & ATTENTION DIET
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

// 8. COMMUNICATION STYLE (DETAILED)
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

// 9. EMOTIONAL TRIGGERS
export interface V4EmotionalProfile {
  positive_triggers: string[];       // ["team_success", "skill_improvement"]
  negative_triggers: string[];       // ["time_wasting", "disrespect"]
  explosive_triggers: string[];      // ["family_threats", "safety_negligence"]
  emotional_regulation: string;      // "high_control", "moderate_control", "low_control"
  stress_responses: string[];        // ["becomes_more_direct", "withdraws"]
}

// 10. INTERNAL CONTRADICTIONS
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

// 11. SEXUALITY PROFILE
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

// COMPLETE V4 FULL PROFILE
export interface V4FullProfile {
  identity: V4Identity;
  motivation_profile: V4MotivationProfile;
  inhibitor_profile: V4InhibitorProfile;
  truth_honesty_profile: V4TruthHonestyProfile;
  identity_salience: V4IdentitySalience;
  knowledge_profile: V4KnowledgeProfile;
  daily_life: V4DailyLife;
  communication_style: V4CommunicationStyle;
  emotional_profile: V4EmotionalProfile;
  contradictions: V4Contradictions;
  sexuality_profile: V4SexualityProfile;
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
  
  knowledge_profile: {
    education_level: string;
    expertise_domains: string[];
    knowledge_gaps: string[];
    vocabulary_ceiling: string;
  };
  
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

// MAIN V4 PERSONA INTERFACE
export interface V4Persona {
  id: string;
  persona_id: string;
  name: string;
  user_id: string;
  schema_version: string;
  profile_image_url?: string;
  
  full_profile: V4FullProfile;
  conversation_summary: V4ConversationSummary;
  
  creation_stage: 'not_started' | 'detailed_traits' | 'summary_generation' | 'completed';
  creation_completed: boolean;
  
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
