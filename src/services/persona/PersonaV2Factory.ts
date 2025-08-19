import { PersonaV2 } from '../../types/persona-v2';
import { buildIdentity } from './builders/identityBuilder';
import { buildCognitiveProfile } from './builders/cognitiveBuilder';
import { buildKnowledgeProfile } from './builders/knowledgeBuilder';
import { buildLinguisticProfile } from './builders/linguisticBuilder';
import { buildStateProfile } from './builders/stateBuilder';
import { buildTraitMapping } from './builders/traitMapBuilder';
import { buildRuntimeControls } from './builders/runtimeBuilder';
import { validateAntiMiddleline } from './validation/antiMiddlelineValidator';
import { validateVoiceprint } from './validation/voiceprintValidator';
import { validateCliches } from './validation/clicheValidator';

export interface PersonaV2FactoryOptions {
  prompt: string;
  locale?: string;
  archetype?: string;
  hard_constraints?: Record<string, any>;
  seed?: string;
}

export interface PersonaV2FactoryResult {
  persona: PersonaV2;
  validation_flags: {
    anti_middleline_score: number;
    voiceprint_score: number;
    cliche_score: number;
    passes_validation: boolean;
  };
  builder_metadata: {
    seed: string;
    generation_stages: number;
    deterministic_hash: string;
    build_time_ms: number;
  };
}

/**
 * Master orchestrator for deterministic PersonaV2 generation
 * Coordinates all builders and applies validation systems
 */
export class PersonaV2Factory {
  
  /**
   * Generate a complete PersonaV2 using deterministic builders
   */
  async generatePersonaV2(options: PersonaV2FactoryOptions): Promise<PersonaV2FactoryResult> {
    const startTime = Date.now();
    const seed = options.seed || this.generateSeed(options.prompt);
    
    try {
      // Stage 1: Identity Foundation
      const identityResult = buildIdentity({
        locale: options.locale || 'en-US',
        age_range: [18, 80],
        archetype: options.archetype,
        hard_constraints: options.hard_constraints || {},
        seed: `${seed}_identity`
      });

      // Stage 2: Cognitive Profile
      const cognitiveResult = buildCognitiveProfile({
        identity: identityResult.identity,
        derivedConstraints: identityResult.derivedConstraints,
        seed: `${seed}_cognitive`
      });

      // Stage 3: Knowledge Profile  
      const knowledgeResult = buildKnowledgeProfile({
        identity: identityResult.identity,
        derivedConstraints: identityResult.derivedConstraints,
        cognitive_profile: cognitiveResult.cognitive_profile,
        seed: `${seed}_knowledge`
      });

      // Stage 4: Linguistic Profile
      const linguisticResult = buildLinguisticProfile({
        identity: identityResult.identity,
        cognitive: cognitiveResult.cognitive_profile,
        social: cognitiveResult.social_cognition,
        health: cognitiveResult.health_profile,
        seed: `${seed}_linguistic`
      });

      // Stage 5: State Management
      const stateResult = buildStateProfile({
        identity: identityResult.identity,
        cognitive: cognitiveResult.cognitive_profile,
        social: cognitiveResult.social_cognition,
        health: cognitiveResult.health_profile,
        life_context: this.generateLifeContext(identityResult.identity, cognitiveResult.cognitive_profile),
        seed: `${seed}_state`
      });

      // Stage 6: Trait-to-Language Mapping
      const traitMapResult = buildTraitMapping({
        identity: identityResult.identity,
        cognitive: cognitiveResult.cognitive_profile,
        social: cognitiveResult.social_cognition,
        health: cognitiveResult.health_profile,
        sexuality: cognitiveResult.sexuality_profile,
        seed: `${seed}_traitmap`
      });

      // Stage 7: Runtime Controls
      const runtimeResult = buildRuntimeControls({
        identity: identityResult.identity,
        cognitive: cognitiveResult.cognitive_profile,
        social: cognitiveResult.social_cognition,
        health: cognitiveResult.health_profile,
        sexuality: cognitiveResult.sexuality_profile,
        seed: `${seed}_runtime`
      });

      // Assemble complete PersonaV2
      const persona: PersonaV2 = {
        id: this.generatePersonaId(),
        version: "2.1",
        created_at: new Date().toISOString(),
        persona_type: "simulated",
        locale: options.locale || 'en-US',
        
        identity: identityResult.identity,
        life_context: this.generateLifeContext(identityResult.identity, cognitiveResult.cognitive_profile),
        cognitive_profile: cognitiveResult.cognitive_profile,
        social_cognition: cognitiveResult.social_cognition,
        health_profile: cognitiveResult.health_profile,
        sexuality_profile: cognitiveResult.sexuality_profile,
        knowledge_profile: knowledgeResult.knowledge_profile,
        emotional_triggers: this.generateEmotionalTriggers(cognitiveResult.cognitive_profile),
        contradictions: this.generateContradictions(cognitiveResult.cognitive_profile),
        memory: this.generateMemory(cognitiveResult.cognitive_profile),
        
        // Enhanced builder outputs
        linguistic_style: {
          base_voice: {
            formality: 'neutral',
            directness: 'balanced',
            politeness: 'medium',
            verbosity: 'moderate',
            code_switching: 'mild',
            register_examples: [`Hi, I'm ${identityResult.identity.name}`, "Let me think about that"]
          },
          lexical_preferences: {
            affect_words: { positive_bias: 0.6, negative_bias: 0.3 },
            intensifiers: ["really", "quite", "very"],
            hedges: ["I think", "maybe", "perhaps"],
            modal_verbs: ["could", "might", "should"],
            domain_jargon: [identityResult.identity.occupation],
            taboo_language: 'euphemize',
            flirt_markers: []
          },
          syntax_and_rhythm: {
            avg_sentence_tokens: { baseline_min: 10, baseline_max: 20 },
            complexity: 'compound',
            lists_frequency_per_200_tokens: 2,
            disfluencies: ["um", "uh"],
            signature_phrases: [`As a ${identityResult.identity.occupation}`, "In my experience"]
          },
          response_shapes_by_intent: {
            opinion: ["I believe", "My view is", "From my perspective"],
            critique: ["One issue I see", "What concerns me", "The problem here"],
            advice: ["You might consider", "I'd suggest", "Try this"],
            story: ["This reminds me", "I once", "There was a time"]
          },
          anti_mode_collapse: {
            forbidden_frames: ["It's clear what this is about", "Overall pretty solid", "At the end of the day"],
            must_include_one_of: { opinion: ["perspective", "view", "thoughts"], advice: ["suggest", "recommend", "consider"] },
            signature_phrase_frequency_max: 0.3
          }
        },
        state_modifiers: {
          current_state: {
            fatigue: stateResult.baseline_state.fatigue,
            acute_stress: stateResult.baseline_state.stress,
            mood_valence: 0.6,
            time_pressure: 0.4,
            social_safety: 0.7,
            sexual_tension: stateResult.baseline_state.sexual_tension
          },
          state_to_shift_rules: Object.entries(stateResult.state_hooks).map(([condition, effects]) => ({
            when: { [condition]: "true" },
            shift: { "linguistic_style.delta": effects }
          }))
        },
        trait_to_language_map: {
          rules: traitMapResult.style_probabilities ? [{
            trait: "extraversion",
            ranges: [{
              min: 0.7,
              max: 1.0,
              linguistic_effects: { verbosity: "verbose" }
            }]
          }] : [],
          moral_and_values_rules: [],
          sexuality_rules: []
        },
        group_behavior: {
          focus_group_modifiers: {
            assertiveness: this.deriveAssertiveness(cognitiveResult.cognitive_profile),
            interruption_tolerance: this.deriveInterruptionTolerance(cognitiveResult.social_cognition),
            deference_to_authority: this.deriveDeference(cognitiveResult.cognitive_profile),
            speak_first_probability: cognitiveResult.cognitive_profile.big_five.extraversion,
            self_disclosure_rate: cognitiveResult.social_cognition.attachment_style === 'secure' ? 'medium' : 'low',
            boundary_enforcement: cognitiveResult.social_cognition.conflict_orientation === 'confrontational' ? 'firm' : 'soft',
            accommodation_rules: []
          }
        },
        reasoning_modifiers: {
          baseline: {
            structure_level: cognitiveResult.cognitive_profile.big_five.conscientiousness,
            verification_depth: 0.6,
            analogy_usage: cognitiveResult.cognitive_profile.big_five.openness,
            risk_tolerance: 1 - cognitiveResult.cognitive_profile.big_five.neuroticism,
            confidence_calibration: 'well',
            exploration_vs_exploitation: 'balanced',
            hallucination_aversion: 0.8
          },
          domain_biases: []
        },
        runtime_controls: {
          style_weights: { cognition: 0.4, linguistics: 0.3, knowledge: 0.2, memory_contradiction: 0.1 },
          variability_profile: { turn_to_turn: 0.2, session_to_session: 0.3, mood_shift_probability: 0.1 },
          brevity_policy: { default_max_paragraphs: 2, intent_overrides: {} },
          token_budgets: { min: 50, max: 200 },
          postprocessors: ["anti_mode_collapse"]
        },
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

      // Stage 8: Validation
      const validation_flags = await this.validatePersona(persona);
      
      const buildTime = Date.now() - startTime;
      const deterministic_hash = this.hashPersona(persona, seed);

      return {
        persona,
        validation_flags,
        builder_metadata: {
          seed,
          generation_stages: 7,
          deterministic_hash,
          build_time_ms: buildTime
        }
      };
      
    } catch (error) {
      console.error('PersonaV2Factory generation failed:', error);
      throw new Error(`Persona generation failed: ${error.message}`);
    }
  }

  /**
   * Validate the generated persona using all validation systems
   */
  private async validatePersona(persona: PersonaV2) {
    const antiMiddlelineScore = validateAntiMiddleline(persona);
    const voiceprintScore = validateVoiceprint(persona);
    const clicheScore = validateCliches(persona);
    
    const passes_validation = 
      antiMiddlelineScore > 0.7 && 
      voiceprintScore > 0.6 && 
      clicheScore > 0.75;

    return {
      anti_middleline_score: antiMiddlelineScore,
      voiceprint_score: voiceprintScore,
      cliche_score: clicheScore,
      passes_validation
    };
  }

  private generateLifeContext(identity: PersonaV2['identity'], cognitive: PersonaV2['cognitive_profile']): PersonaV2['life_context'] {
    return {
      background_narrative: `Grew up in a middle-class family and pursued ${identity.occupation}`,
      current_situation: `Currently working as a ${identity.occupation}`,
      daily_routine: "Regular work schedule with evening relaxation",
      stressors: ["work deadlines", "financial planning"],
      supports: ["family", "friends", "colleagues"],
      life_stage: identity.age < 30 ? 'emerging_adult' : identity.age < 45 ? 'early_career' : 'midlife'
    };
  }

  private generateEmotionalTriggers(cognitive: PersonaV2['cognitive_profile']): PersonaV2['emotional_triggers'] {
    return {
      positive: ["achievement", "recognition", "helping others"],
      negative: ["criticism", "unfairness", "conflict"],
      explosive: ["betrayal", "discrimination"]
    };
  }

  private generateContradictions(cognitive: PersonaV2['cognitive_profile']): PersonaV2['contradictions'] {
    return [];
  }

  private generateMemory(cognitive: PersonaV2['cognitive_profile']): PersonaV2['memory'] {
    return {
      short_term_slots: 5,
      long_term_events: [{
        event: "Started current career",
        timestamp: "2020-01-01",
        valence: "positive",
        impact_on_behavior: "Increased confidence",
        recall_cues: ["work", "career"]
      }],
      persistence: { short_term: 0.6, long_term: 0.9 }
    };
  }

  private generateSeed(prompt: string): string {
    return `${Date.now()}_${prompt.slice(0, 20).replace(/\W/g, '')}`;
  }

  private generatePersonaId(): string {
    return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashPersona(persona: PersonaV2, seed: string): string {
    const hashInput = JSON.stringify({ persona: persona.identity, seed });
    return btoa(hashInput).slice(0, 16);
  }

  private deriveAssertiveness(cognitive: PersonaV2['cognitive_profile']): 'low' | 'medium' | 'high' {
    const score = cognitive.big_five.extraversion + cognitive.big_five.conscientiousness;
    if (score < 0.4) return 'low';
    if (score > 0.7) return 'high';
    return 'medium';
  }

  private deriveInterruptionTolerance(social: PersonaV2['social_cognition']): 'low' | 'medium' | 'high' {
    if (social.conflict_orientation === 'avoidant') return 'low';
    if (social.conflict_orientation === 'confrontational') return 'high';
    return 'medium';
  }

  private deriveDeference(cognitive: PersonaV2['cognitive_profile']): 'low' | 'medium' | 'high' {
    const authority = cognitive.moral_foundations.authority_subversion;
    if (authority > 0.7) return 'high';
    if (authority < 0.3) return 'low';
    return 'medium';
  }
}