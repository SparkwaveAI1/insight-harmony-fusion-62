// PersonaV2 type definitions for Supabase Edge Functions

export interface PersonaV2Identity {
  name: string;
  age: number;
  gender: string;
  pronouns: string;
  ethnicity: string;
  nationality: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  occupation: string;
  relationship_status: "single" | "dating" | "committed" | "married" | "separated" | "divorced" | "widowed";
  dependents: number;
}

export interface PersonaV2LifeContext {
  background_narrative: string;
  current_situation: string;
  daily_routine: string;
  stressors: string[];
  supports: string[];
  life_stage: "emerging_adult" | "early_career" | "midlife" | "late_career" | "retired";
}

export interface PersonaV2CognitiveProfile {
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  intelligence: {
    level: "low" | "average" | "high" | "gifted";
    type: ("analytical" | "creative" | "practical" | "emotional")[];
  };
  decision_style: "logical" | "emotional" | "impulsive" | "risk-averse" | "risk-seeking" | "procedural";
  moral_foundations: {
    care_harm: number;
    fairness_cheating: number;
    loyalty_betrayal: number;
    authority_subversion: number;
    sanctity_degradation: number;
    liberty_oppression: number;
  };
  temporal_orientation: "past" | "present" | "future" | "balanced";
  worldview_summary: string;
}

export interface PersonaV2SocialCognition {
  empathy: "low" | "medium" | "high";
  theory_of_mind: "low" | "medium" | "high";
  trust_baseline: "low" | "medium" | "high";
  conflict_orientation: "avoidant" | "collaborative" | "confrontational" | "competitive";
  persuasion_style: "story-led" | "evidence-led" | "authority-led" | "reciprocity-led" | "status-led";
  attachment_style: "secure" | "anxious" | "avoidant" | "disorganized";
  ingroup_outgroup_sensitivity: "low" | "medium" | "high";
}

export interface PersonaV2HealthProfile {
  mental_health: ("none" | "anxiety" | "depression" | "adhd" | "ptsd" | "bipolar" | "other")[];
  physical_health: ("healthy" | "chronic_illness" | "disabled")[];
  substance_use: ("none" | "alcohol" | "tobacco" | "cannabis" | "stimulants" | "opioids" | "other")[];
  energy_baseline: "low" | "medium" | "high";
  circadian_rhythm: "morning" | "evening" | "irregular";
}

export interface PersonaV2SexualityProfile {
  orientation: "heterosexual" | "homosexual" | "bisexual" | "pansexual" | "asexual" | "questioning" | "other";
  privacy_preference: "private" | "selective" | "public";
}

export interface PersonaV2KnowledgeProfile {
  domains_of_expertise: string[];
  general_knowledge_level: "low" | "average" | "high";
  tech_literacy: "low" | "medium" | "high";
}

export interface PersonaV2EmotionalTriggers {
  positive: string[];
  negative: string[];
}

export interface PersonaV2 {
  id: string;
  version: "2.1";
  created_at: string;
  persona_type: "simulated" | "human_seeded" | "hybrid";
  locale: string;
  profile_image_url?: string;
  identity: PersonaV2Identity;
  life_context: PersonaV2LifeContext;
  cognitive_profile: PersonaV2CognitiveProfile;
  social_cognition: PersonaV2SocialCognition;
  health_profile: PersonaV2HealthProfile;
  sexuality_profile?: PersonaV2SexualityProfile;
  knowledge_profile?: PersonaV2KnowledgeProfile;
  emotional_triggers?: PersonaV2EmotionalTriggers;
}