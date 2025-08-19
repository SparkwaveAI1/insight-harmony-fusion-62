import * as z from "zod";

// Location schema
const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  country: z.string().min(1, "Country is required"),
});

// Identity section
export const identitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(1).max(120),
  gender: z.string().min(1, "Gender is required"),
  pronouns: z.string().min(1, "Pronouns are required"),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  nationality: z.string().min(1, "Nationality is required"),
  location: locationSchema,
  occupation: z.string().min(1, "Occupation is required"),
  relationship_status: z.enum(["single", "dating", "committed", "married", "separated", "divorced", "widowed"]),
  dependents: z.number().min(0),
});

// Life context section
export const lifeContextSchema = z.object({
  background_narrative: z.string().min(10, "Background narrative must be at least 10 characters"),
  current_situation: z.string().min(10, "Current situation must be at least 10 characters"),
  daily_routine: z.string().min(10, "Daily routine must be at least 10 characters"),
  stressors: z.array(z.string()).min(1, "At least one stressor is required"),
  supports: z.array(z.string()).min(1, "At least one support is required"),
  life_stage: z.enum(["emerging_adult", "early_career", "midlife", "late_career", "retired"]),
});

// Cognitive profile section
export const cognitiveProfileSchema = z.object({
  big_five: z.object({
    openness: z.number().min(0).max(1),
    conscientiousness: z.number().min(0).max(1),
    extraversion: z.number().min(0).max(1),
    agreeableness: z.number().min(0).max(1),
    neuroticism: z.number().min(0).max(1),
  }),
  intelligence: z.object({
    level: z.enum(["low", "average", "high", "gifted"]),
    type: z.array(z.enum(["analytical", "creative", "practical", "emotional"])).min(1),
  }),
  decision_style: z.enum(["logical", "emotional", "impulsive", "risk-averse", "risk-seeking", "procedural"]),
  moral_foundations: z.object({
    care_harm: z.number().min(0).max(1),
    fairness_cheating: z.number().min(0).max(1),
    loyalty_betrayal: z.number().min(0).max(1),
    authority_subversion: z.number().min(0).max(1),
    sanctity_degradation: z.number().min(0).max(1),
    liberty_oppression: z.number().min(0).max(1),
  }),
  temporal_orientation: z.enum(["past", "present", "future", "balanced"]),
  worldview_summary: z.string().min(10, "Worldview summary must be at least 10 characters"),
});

// Social cognition section
export const socialCognitionSchema = z.object({
  empathy: z.enum(["low", "medium", "high"]),
  theory_of_mind: z.enum(["low", "medium", "high"]),
  trust_baseline: z.enum(["low", "medium", "high"]),
  conflict_orientation: z.enum(["avoidant", "collaborative", "confrontational", "competitive"]),
  persuasion_style: z.enum(["story-led", "evidence-led", "authority-led", "reciprocity-led", "status-led"]),
  attachment_style: z.enum(["secure", "anxious", "avoidant", "disorganized"]),
  ingroup_outgroup_sensitivity: z.enum(["low", "medium", "high"]),
});

// Health profile section
export const healthProfileSchema = z.object({
  mental_health: z.array(z.enum(["none", "anxiety", "depression", "adhd", "ptsd", "bipolar", "other"])).min(1),
  physical_health: z.array(z.enum(["healthy", "chronic_illness", "disabled"])).min(1),
  substance_use: z.array(z.enum(["none", "alcohol", "tobacco", "cannabis", "stimulants", "opioids", "other"])).min(1),
  energy_baseline: z.enum(["low", "medium", "high"]),
  circadian_rhythm: z.enum(["morning", "evening", "irregular"]),
});

// Complete PersonaV2 schema
export const personaV2Schema = z.object({
  id: z.string(),
  version: z.literal("2.1"),
  created_at: z.string(),
  persona_type: z.enum(["simulated", "human_seeded", "hybrid"]),
  locale: z.string(),
  profile_image_url: z.string().optional(),
  identity: identitySchema,
  life_context: lifeContextSchema,
  cognitive_profile: cognitiveProfileSchema,
  social_cognition: socialCognitionSchema,
  health_profile: healthProfileSchema,
  // Simplified for core creation - other sections can be auto-generated or added later
  sexuality_profile: z.object({
    orientation: z.enum(["heterosexual", "homosexual", "bisexual", "pansexual", "asexual", "questioning", "other"]),
    privacy_preference: z.enum(["private", "selective", "public"]),
  }).optional(),
  knowledge_profile: z.object({
    domains_of_expertise: z.array(z.string()),
    general_knowledge_level: z.enum(["low", "average", "high"]),
    tech_literacy: z.enum(["low", "medium", "high"]),
  }).optional(),
  emotional_triggers: z.object({
    positive: z.array(z.string()),
    negative: z.array(z.string()),
  }).optional(),
});

export type PersonaV2FormData = z.infer<typeof personaV2Schema>;

// Default values for the form
export const defaultPersonaV2Values = {
  identity: {
    name: "",
    age: 25,
    gender: "",
    pronouns: "",
    ethnicity: "",
    nationality: "",
    location: { city: "", region: "", country: "" },
    occupation: "",
    relationship_status: "single" as const,
    dependents: 0,
  },
  life_context: {
    background_narrative: "",
    current_situation: "",
    daily_routine: "",
    stressors: [""],
    supports: [""],
    life_stage: "early_career" as const,
  },
  cognitive_profile: {
    big_five: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    intelligence: {
      level: "average" as const,
      type: ["analytical" as const],
    },
    decision_style: "logical" as const,
    moral_foundations: {
      care_harm: 0.5,
      fairness_cheating: 0.5,
      loyalty_betrayal: 0.5,
      authority_subversion: 0.5,
      sanctity_degradation: 0.5,
      liberty_oppression: 0.5,
    },
    temporal_orientation: "balanced" as const,
    worldview_summary: "",
  },
  social_cognition: {
    empathy: "medium" as const,
    theory_of_mind: "medium" as const,
    trust_baseline: "medium" as const,
    conflict_orientation: "collaborative" as const,
    persuasion_style: "evidence-led" as const,
    attachment_style: "secure" as const,
    ingroup_outgroup_sensitivity: "medium" as const,
  },
  health_profile: {
    mental_health: ["none" as const],
    physical_health: ["healthy" as const],
    substance_use: ["none" as const],
    energy_baseline: "medium" as const,
    circadian_rhythm: "morning" as const,
  },
  sexuality_profile: {
    orientation: "heterosexual" as const,
    privacy_preference: "selective" as const,
  },
  knowledge_profile: {
    domains_of_expertise: [""],
    general_knowledge_level: "average" as const,
    tech_literacy: "medium" as const,
  },
  emotional_triggers: {
    positive: [""],
    negative: [""],
  },
};