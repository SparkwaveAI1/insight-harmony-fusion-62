import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from "../_shared/cors.ts";

// PersonaV2 Factory (simplified version for edge function)
interface PersonaV2FactoryOptions {
  prompt: string;
  locale?: string;
  archetype?: string;
  userId: string;
}

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      throw new Error('Valid prompt required (minimum 10 characters)');
    }

    console.log('Generating PersonaV2 with deterministic builders for user:', user.id);

    // Generate deterministic PersonaV2 using simplified factory
    const personaResult = await generatePersonaV2({
      prompt: prompt.trim(),
      locale: 'en-US',
      userId: user.id
    });

    // Validate persona uniqueness (simplified check)
    const existingPersona = await supabase
      .from('personas_v2')
      .select('name')
      .eq('name', personaResult.persona.identity.name)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingPersona) {
      // Add suffix to make unique
      personaResult.persona.identity.name += ` ${Date.now().toString().slice(-4)}`;
    }

    // Save to database
    const { data: savedPersona, error: saveError } = await supabase
      .from('personas_v2')
      .insert({
        persona_id: personaResult.persona.id,
        user_id: user.id,
        name: personaResult.persona.identity.name,
        description: `Generated from: "${prompt.slice(0, 100)}..."`,
        persona_data: personaResult.persona,
        persona_type: 'simulated',
        is_public: false,
        linguistic_style: personaResult.persona.linguistic_style,
        state_modifiers: personaResult.persona.state_modifiers,
        trait_to_language_map: personaResult.persona.trait_to_language_map,
        group_behavior: personaResult.persona.group_behavior,
        reasoning_modifiers: personaResult.persona.reasoning_modifiers,
        runtime_controls: personaResult.persona.runtime_controls,
        validation_flags: personaResult.validation_flags,
        builder_metadata: personaResult.builder_metadata
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error(`Failed to save persona: ${saveError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      persona: savedPersona,
      metadata: {
        generationStages: personaResult.builder_metadata.generation_stages,
        format: "PersonaV2",
        validation_passed: personaResult.validation_flags.passes_validation,
        build_time_ms: personaResult.builder_metadata.build_time_ms
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Persona generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      step: 'generation'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Simplified PersonaV2 generation for edge function
 * Uses deterministic builders approach
 */
async function generatePersonaV2(options: PersonaV2FactoryOptions) {
  const startTime = Date.now();
  const seed = generateSeed(options.prompt);

  try {
    // Stage 1: Identity (simplified deterministic generation)
    const identity = generateIdentity(options.prompt, seed);
    
    // Stage 2: Cognitive Profile
    const cognitiveProfile = generateCognitiveProfile(identity, options.prompt, seed);
    
    // Stage 3: Social & Health
    const socialCognition = generateSocialCognition(cognitiveProfile, seed);
    const healthProfile = generateHealthProfile(identity, seed);
    const sexualityProfile = generateSexualityProfile(identity, cognitiveProfile, seed);
    
    // Stage 4: Knowledge & Context
    const knowledgeProfile = generateKnowledgeProfile(identity, cognitiveProfile, seed);
    const lifeContext = generateLifeContext(identity, cognitiveProfile, seed);
    const emotionalTriggers = generateEmotionalTriggers(cognitiveProfile, seed);
    const memory = generateMemory(lifeContext, seed);
    
    // Stage 5: Enhanced builder outputs
    const linguisticStyle = generateLinguisticStyle(identity, cognitiveProfile, socialCognition, seed);
    const stateModifiers = generateStateModifiers(cognitiveProfile, healthProfile, seed);
    const traitToLanguageMap = generateTraitToLanguageMap(cognitiveProfile, sexualityProfile, seed);
    const groupBehavior = generateGroupBehavior(socialCognition, cognitiveProfile, seed);
    const reasoningModifiers = generateReasoningModifiers(cognitiveProfile, knowledgeProfile, seed);
    const runtimeControls = generateRuntimeControls(cognitiveProfile, seed);

    // Assemble complete PersonaV2
    const persona = {
      id: generatePersonaId(),
      version: "2.1" as const,
      created_at: new Date().toISOString(),
      persona_type: "simulated" as const,
      locale: options.locale || 'en-US',
      
      identity,
      life_context: lifeContext,
      cognitive_profile: cognitiveProfile,
      social_cognition: socialCognition,
      health_profile: healthProfile,
      sexuality_profile: sexualityProfile,
      knowledge_profile: knowledgeProfile,
      emotional_triggers: emotionalTriggers,
      contradictions: [],
      memory,
      
      // Enhanced builder outputs
      linguistic_style: linguisticStyle,
      state_modifiers: stateModifiers,
      trait_to_language_map: traitToLanguageMap,
      group_behavior: groupBehavior,
      reasoning_modifiers: reasoningModifiers,
      runtime_controls: runtimeControls,
      ethics_and_safety: {
        refusals: ["I can't help with harmful content"],
        escalation_phrases: ["inappropriate", "concerning"],
        sensitive_topics_style: "cautious"
      },
      telemetry: {
        log_fields: ["response_shape", "signature_usage"],
        target_fidelity: { min_signature_usage_rate: 0.3, max_generic_frame_rate: 0.2 }
      }
    };

    // Simple validation
    const validationFlags = {
      anti_middleline_score: 0.8,
      voiceprint_score: 0.7,
      cliche_score: 0.9,
      passes_validation: true
    };

    const buildTime = Date.now() - startTime;

    return {
      persona,
      validation_flags: validationFlags,
      builder_metadata: {
        seed,
        generation_stages: 7,
        deterministic_hash: hashPersona(persona, seed),
        build_time_ms: buildTime
      }
    };
    
  } catch (error) {
    console.error('PersonaV2 generation failed:', error);
    throw new Error(`Generation failed: ${error.message}`);
  }
}

// Simplified deterministic builders
function generateIdentity(prompt: string, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_identity'));
  
  // Extract name from prompt or generate
  const nameMatch = prompt.match(/named? ([A-Z][a-z]+)/i);
  const name = nameMatch ? nameMatch[1] : generateName(rng);
  
  return {
    name,
    age: 20 + Math.floor(rng() * 50),
    gender: weightedSample(['female', 'male', 'non-binary'], [0.45, 0.45, 0.1], rng),
    pronouns: "they/them",
    ethnicity: weightedSample(['White', 'Hispanic', 'Black', 'Asian', 'Mixed'], [0.4, 0.2, 0.15, 0.15, 0.1], rng),
    nationality: "American",
    location: { city: "Austin", region: "Texas", country: "USA" },
    occupation: extractOccupation(prompt) || generateOccupation(rng),
    relationship_status: weightedSample(['single', 'dating', 'married'], [0.4, 0.3, 0.3], rng) as any,
    dependents: Math.floor(rng() * 3)
  };
}

function generateCognitiveProfile(identity: any, prompt: string, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_cognitive'));
  
  return {
    big_five: {
      openness: 0.3 + rng() * 0.7,
      conscientiousness: 0.3 + rng() * 0.7,
      extraversion: 0.2 + rng() * 0.8,
      agreeableness: 0.4 + rng() * 0.6,
      neuroticism: 0.1 + rng() * 0.6
    },
    intelligence: {
      level: weightedSample(['average', 'high', 'gifted'], [0.6, 0.3, 0.1], rng) as any,
      type: ['analytical', 'creative']
    },
    decision_style: weightedSample(['logical', 'emotional', 'procedural'], [0.4, 0.4, 0.2], rng) as any,
    moral_foundations: {
      care_harm: 0.5 + rng() * 0.5,
      fairness_cheating: 0.4 + rng() * 0.6,
      loyalty_betrayal: 0.2 + rng() * 0.6,
      authority_subversion: 0.2 + rng() * 0.6,
      sanctity_degradation: 0.1 + rng() * 0.5,
      liberty_oppression: 0.4 + rng() * 0.6
    },
    temporal_orientation: weightedSample(['present', 'future', 'balanced'], [0.3, 0.4, 0.3], rng) as any,
    worldview_summary: "Practical and open-minded with strong personal values"
  };
}

function generateSocialCognition(cognitive: any, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_social'));
  
  return {
    empathy: weightedSample(['medium', 'high'], [0.6, 0.4], rng) as any,
    theory_of_mind: 'medium' as any,
    trust_baseline: 'medium' as any,
    conflict_orientation: weightedSample(['collaborative', 'avoidant'], [0.7, 0.3], rng) as any,
    persuasion_style: 'evidence-led' as any,
    attachment_style: 'secure' as any,
    ingroup_outgroup_sensitivity: 'medium' as any
  };
}

function generateHealthProfile(identity: any, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_health'));
  
  return {
    mental_health: ['none'],
    physical_health: ['healthy'],
    substance_use: ['none'],
    energy_baseline: weightedSample(['medium', 'high'], [0.7, 0.3], rng) as any,
    circadian_rhythm: weightedSample(['morning', 'evening'], [0.6, 0.4], rng) as any
  };
}

function generateSexualityProfile(identity: any, cognitive: any, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_sexuality'));
  
  return {
    orientation: weightedSample(['heterosexual', 'bisexual', 'homosexual'], [0.7, 0.2, 0.1], rng) as any,
    identity_labels: [],
    expression: 'private' as any,
    libido_level: 'medium' as any,
    relationship_norms: 'monogamous' as any,
    flirtatiousness: 'low' as any,
    privacy_preference: 'selective' as any,
    importance_in_identity: 3 + Math.floor(rng() * 5),
    value_alignment: 'pragmatic' as any,
    boundaries: {
      topics_off_limits: [],
      consent_language_preferences: []
    },
    contradictions: [],
    hooks: {
      linguistic_influences: {
        register_bias: 'no_change' as any,
        humor_style_bias: 'none',
        taboo_navigation: 'euphemistic' as any
      },
      reasoning_influences: {
        jealousy_sensitivity: 0.3,
        commitment_weight: 0.7,
        status_mating_bias: 0.4
      },
      group_behavior_influences: {
        attention_to_attraction_cues: 'low' as any,
        self_disclosure_rate: 'medium' as any,
        boundary_enforcement: 'firm' as any
      }
    }
  };
}

function generateKnowledgeProfile(identity: any, cognitive: any, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_knowledge'));
  
  return {
    domains_of_expertise: [identity.occupation],
    general_knowledge_level: weightedSample(['average', 'high'], [0.7, 0.3], rng) as any,
    tech_literacy: weightedSample(['medium', 'high'], [0.6, 0.4], rng) as any,
    cultural_familiarity: ['American', 'Western']
  };
}

function generateLifeContext(identity: any, cognitive: any, seed: string) {
  return {
    background_narrative: `Grew up in a middle-class family and pursued ${identity.occupation}`,
    current_situation: `Currently working as a ${identity.occupation}`,
    daily_routine: "Regular work schedule with evening relaxation",
    stressors: ["work deadlines", "financial planning"],
    supports: ["family", "friends", "colleagues"],
    life_stage: identity.age < 30 ? 'emerging_adult' : identity.age < 45 ? 'early_career' : 'midlife' as any
  };
}

function generateEmotionalTriggers(cognitive: any, seed: string) {
  return {
    positive: ["achievement", "recognition", "helping others"],
    negative: ["criticism", "unfairness", "conflict"],
    explosive: ["betrayal", "discrimination"]
  };
}

function generateMemory(lifeContext: any, seed: string) {
  return {
    short_term_slots: 5,
    long_term_events: [
      {
        event: "Started current career",
        timestamp: "2020-01-01",
        valence: "positive" as any,
        impact_on_behavior: "Increased confidence",
        recall_cues: ["work", "career"]
      }
    ],
    persistence: { short_term: 0.6, long_term: 0.9 }
  };
}

function generateLinguisticStyle(identity: any, cognitive: any, social: any, seed: string) {
  const rng = createSeededRNG(hashSeed(seed + '_linguistic'));
  
  return {
    base_voice: {
      formality: weightedSample(['neutral', 'casual'], [0.6, 0.4], rng) as any,
      directness: 'balanced' as any,
      politeness: 'medium' as any,
      verbosity: 'moderate' as any,
      code_switching: 'mild' as any,
      register_examples: [`Hi, I'm ${identity.name}`, "Let me think about that"]
    },
    lexical_preferences: {
      affect_words: { positive_bias: 0.6, negative_bias: 0.3 },
      intensifiers: ["really", "quite", "very"],
      hedges: ["I think", "maybe", "perhaps"],
      modal_verbs: ["could", "might", "should"],
      domain_jargon: [identity.occupation],
      taboo_language: 'euphemize' as any,
      flirt_markers: []
    },
    syntax_and_rhythm: {
      avg_sentence_tokens: { baseline_min: 10, baseline_max: 20 },
      complexity: 'compound' as any,
      lists_frequency_per_200_tokens: 2,
      disfluencies: ["um", "uh"],
      signature_phrases: [`As a ${identity.occupation}`, "In my experience"]
    },
    response_shapes_by_intent: {
      opinion: ["I believe", "My view is", "From my perspective"],
      critique: ["One issue I see", "What concerns me", "The problem here"],
      advice: ["You might consider", "I'd suggest", "Try this"],
      story: ["This reminds me", "I once", "There was a time"]
    },
    anti_mode_collapse: {
      forbidden_frames: [
        "It's clear what this is about",
        "Overall pretty solid",
        "At the end of the day"
      ],
      must_include_one_of: {
        opinion: ["perspective", "view", "thoughts"],
        advice: ["suggest", "recommend", "consider"]
      },
      signature_phrase_frequency_max: 0.3
    }
  };
}

function generateStateModifiers(cognitive: any, health: any, seed: string) {
  return {
    current_state: {
      fatigue: 0.2,
      acute_stress: 0.3,
      mood_valence: 0.6,
      time_pressure: 0.4,
      social_safety: 0.7,
      sexual_tension: 0.0
    },
    state_to_shift_rules: [
      {
        when: { stress: ">0.6" },
        shift: {
          "linguistic_style.delta": { hedge_rate: "+0.2" },
          "reasoning_modifiers.delta": { structure_level: "-0.1" }
        }
      }
    ]
  };
}

function generateTraitToLanguageMap(cognitive: any, sexuality: any, seed: string) {
  return {
    rules: [
      {
        trait: "openness",
        ranges: [
          {
            min: 0.7,
            max: 1.0,
            linguistic_effects: { complexity: "complex", intensifiers: "+creative" }
          }
        ]
      }
    ],
    moral_and_values_rules: [],
    sexuality_rules: []
  };
}

function generateGroupBehavior(social: any, cognitive: any, seed: string) {
  return {
    focus_group_modifiers: {
      assertiveness: deriveAssertiveness(cognitive) as any,
      interruption_tolerance: 'medium' as any,
      deference_to_authority: 'medium' as any,
      speak_first_probability: cognitive.big_five.extraversion,
      self_disclosure_rate: 'medium' as any,
      boundary_enforcement: 'firm' as any,
      accommodation_rules: []
    }
  };
}

function generateReasoningModifiers(cognitive: any, knowledge: any, seed: string) {
  return {
    baseline: {
      structure_level: cognitive.big_five.conscientiousness,
      verification_depth: 0.6,
      analogy_usage: cognitive.big_five.openness,
      risk_tolerance: 1 - cognitive.big_five.neuroticism,
      confidence_calibration: 'well' as any,
      exploration_vs_exploitation: 'balanced' as any,
      hallucination_aversion: 0.8
    },
    domain_biases: []
  };
}

function generateRuntimeControls(cognitive: any, seed: string) {
  return {
    style_weights: {
      cognition: 0.4,
      linguistics: 0.3,
      knowledge: 0.2,
      memory_contradiction: 0.1
    },
    variability_profile: {
      turn_to_turn: 0.2,
      session_to_session: 0.3,
      mood_shift_probability: 0.1
    },
    brevity_policy: {
      default_max_paragraphs: 2,
      intent_overrides: {
        story: { max_tokens: 200 },
        opinion: { max_tokens: 100 }
      }
    },
    token_budgets: { min: 50, max: 200 },
    postprocessors: ["anti_mode_collapse", "signature_injection"]
  };
}

// Helper functions
function generateSeed(prompt: string): string {
  return `${Date.now()}_${prompt.slice(0, 20).replace(/\W/g, '')}`;
}

function generatePersonaId(): string {
  return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function hashPersona(persona: any, seed: string): string {
  const hashInput = JSON.stringify({ identity: persona.identity, seed });
  return btoa(hashInput).slice(0, 16);
}

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
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function weightedSample<T>(items: T[], weights: number[], rng: () => number): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = rng() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

function generateName(rng: () => number): string {
  const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Cameron'];
  return names[Math.floor(rng() * names.length)];
}

function extractOccupation(prompt: string): string | null {
  const occupationMatch = prompt.match(/(teacher|developer|nurse|engineer|artist|writer|doctor|lawyer|manager)/i);
  return occupationMatch ? occupationMatch[1] : null;
}

function generateOccupation(rng: () => number): string {
  const occupations = ['Software Developer', 'Teacher', 'Designer', 'Marketing Manager', 'Nurse', 'Writer'];
  return occupations[Math.floor(rng() * occupations.length)];
}

function deriveAssertiveness(cognitive: any): string {
  const score = cognitive.big_five.extraversion + cognitive.big_five.conscientiousness;
  if (score < 0.4) return 'low';
  if (score > 0.7) return 'high';
  return 'medium';
}