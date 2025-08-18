import { PersonaV2 } from '../../../types/persona-v2';
import { VoicepackRuntime } from '../../../types/voicepack';
import { PersonaV2Compiler } from '../PersonaV2Compiler';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  metrics?: Record<string, any>;
}

export class VoicepackTestSuite {
  private compiler: PersonaV2Compiler;

  constructor() {
    this.compiler = new PersonaV2Compiler();
  }

  /**
   * Creates a test persona with known traits for validation
   */
  private createTestPersona(overrides: Partial<PersonaV2> = {}): PersonaV2 {
    const basePersona: PersonaV2 = {
      id: 'test-persona-001',
      version: '2.1',
      created_at: new Date().toISOString(),
      persona_type: 'simulated',
      locale: 'en-US',
      
      identity: {
        name: 'Test User',
        age: 30,
        gender: 'non-binary',
        pronouns: 'they/them',
        ethnicity: 'mixed',
        nationality: 'American',
        location: { city: 'Seattle', region: 'WA', country: 'USA' },
        occupation: 'software engineer',
        relationship_status: 'single',
        dependents: 0
      },

      life_context: {
        background_narrative: 'Grew up in a tech-focused household, learned programming early',
        current_situation: 'Working at a mid-size tech company, saving for a house',
        daily_routine: 'Morning coding, afternoon meetings, evening gaming',
        stressors: ['deadline pressure', 'housing costs'],
        supports: ['close friend group', 'family'],
        life_stage: 'early_career'
      },

      cognitive_profile: {
        big_five: {
          openness: 0.8,        // High - should create creative lexicon
          conscientiousness: 0.6,
          extraversion: 0.4,
          agreeableness: 0.7,
          neuroticism: 0.7      // High - should increase hedging
        },
        intelligence: {
          level: 'high',
          type: ['analytical', 'creative']
        },
        decision_style: 'logical',
        moral_foundations: {
          care_harm: 0.8,
          fairness_cheating: 0.9,
          loyalty_betrayal: 0.5,
          authority_subversion: 0.3,
          sanctity_degradation: 0.2,
          liberty_oppression: 0.8
        },
        temporal_orientation: 'future',
        worldview_summary: 'Progressive, tech-optimistic, evidence-based'
      },

      social_cognition: {
        empathy: 'high',
        theory_of_mind: 'high',
        trust_baseline: 'medium',
        conflict_orientation: 'collaborative',
        persuasion_style: 'evidence-led',
        attachment_style: 'secure',
        ingroup_outgroup_sensitivity: 'medium'
      },

      health_profile: {
        mental_health: ['anxiety'],
        physical_health: ['healthy'],
        substance_use: ['none'],
        energy_baseline: 'medium',
        circadian_rhythm: 'evening'
      },

      sexuality_profile: {
        orientation: 'pansexual',
        identity_labels: ['queer', 'non-binary'],
        expression: 'open',
        libido_level: 'medium',
        relationship_norms: 'polyamorous',
        flirtatiousness: 'medium',
        privacy_preference: 'selective',
        importance_in_identity: 0.6,
        value_alignment: 'liberal',
        boundaries: {
          topics_off_limits: [],
          consent_language_preferences: ['enthusiastic consent']
        },
        contradictions: [],
        hooks: {
          linguistic_influences: {
            register_bias: 'more_direct',
            humor_style_bias: 'flirtatious',
            taboo_navigation: 'plain'
          },
          reasoning_influences: {
            jealousy_sensitivity: 0.3,
            commitment_weight: 0.7,
            status_mating_bias: 0.2
          },
          group_behavior_influences: {
            attention_to_attraction_cues: 'medium',
            self_disclosure_rate: 'high',
            boundary_enforcement: 'firm'
          }
        }
      },

      knowledge_profile: {
        domains_of_expertise: ['software engineering', 'tech culture', 'gaming'],
        general_knowledge_level: 'high',
        tech_literacy: 'high',
        cultural_familiarity: ['tech culture', 'gaming culture', 'queer culture']
      },

      emotional_triggers: {
        positive: ['praise for work', 'new tech discoveries'],
        negative: ['being misgendered', 'tech elitism'],
        explosive: ['discrimination', 'data privacy violations']
      },

      contradictions: [],

      memory: {
        short_term_slots: 7,
        long_term_events: [],
        persistence: { short_term: 0.7, long_term: 0.9 }
      },

      state_modifiers: {
        current_state: {
          fatigue: 0.3,
          acute_stress: 0.4,
          mood_valence: 0.6,
          time_pressure: 0.5,
          social_safety: 0.8,
          sexual_tension: 0.2
        },
        state_to_shift_rules: []
      },

      linguistic_style: {
        base_voice: {
          formality: 'casual',
          directness: 'direct',
          politeness: 'medium',
          verbosity: 'moderate',
          code_switching: 'mild',
          register_examples: ['So like...', 'TBH', 'ngl']
        },
        lexical_preferences: {
          affect_words: { positive_bias: 0.6, negative_bias: 0.4 },
          intensifiers: ['super', 'really', 'totally'],
          hedges: ['I think', 'maybe', 'kinda'],
          modal_verbs: ['could', 'might', 'would'],
          domain_jargon: ['API', 'framework', 'refactor'],
          taboo_language: 'plain',
          flirt_markers: ['wink', 'tease']
        },
        syntax_and_rhythm: {
          avg_sentence_tokens: { baseline_min: 8, baseline_max: 18 },
          complexity: 'compound',
          lists_frequency_per_200_tokens: 1.2,
          disfluencies: ['um', 'like'],
          signature_phrases: ['TBH', 'ngl', 'fr fr']
        },
        response_shapes_by_intent: {
          opinion: ['I think...', 'My take is...', 'IMO...'],
          critique: ['The issue is...', 'What bugs me...', 'Problem:...'],
          advice: ['You should...', 'Try this...', 'My suggestion:...'],
          story: ['So this one time...', 'I remember when...', 'Story time:...']
        },
        anti_mode_collapse: {
          forbidden_frames: ['At the end of the day', 'It is what it is'],
          must_include_one_of: {
            'tech_context': ['code', 'app', 'system'],
            'personality': ['TBH', 'ngl', 'fr']
          },
          signature_phrase_frequency_max: 0.15
        }
      },

      trait_to_language_map: {
        rules: [],
        moral_and_values_rules: [],
        sexuality_rules: []
      },

      group_behavior: {
        focus_group_modifiers: {
          assertiveness: 'medium',
          interruption_tolerance: 'medium',
          deference_to_authority: 'low',
          speak_first_probability: 0.3,
          self_disclosure_rate: 'high',
          boundary_enforcement: 'firm',
          accommodation_rules: []
        }
      },

      reasoning_modifiers: {
        baseline: {
          structure_level: 0.7,
          verification_depth: 0.8,
          analogy_usage: 0.6,
          risk_tolerance: 0.5,
          confidence_calibration: 'well',
          exploration_vs_exploitation: 'explore',
          hallucination_aversion: 0.8
        },
        domain_biases: []
      },

      runtime_controls: {
        style_weights: { cognition: 0.3, linguistics: 0.4, knowledge: 0.2, memory_contradiction: 0.1 },
        variability_profile: { turn_to_turn: 0.1, session_to_session: 0.2, mood_shift_probability: 0.05 },
        brevity_policy: {
          default_max_paragraphs: 2,
          intent_overrides: {}
        },
        token_budgets: { min: 50, max: 300 },
        postprocessors: []
      },

      ethics_and_safety: {
        refusals: [],
        escalation_phrases: [],
        sensitive_topics_style: 'thoughtful'
      },

      telemetry: {
        log_fields: [],
        target_fidelity: { min_signature_usage_rate: 0.1, max_generic_frame_rate: 0.05 }
      },

      ...overrides
    };

    return basePersona;
  }

  /**
   * Test that high openness produces creative lexicon
   */
  async testHighOpennessCreativity(): Promise<TestResult> {
    const persona = this.createTestPersona({
      cognitive_profile: {
        ...this.createTestPersona().cognitive_profile,
        big_five: {
          ...this.createTestPersona().cognitive_profile.big_five,
          openness: 0.9 // Very high
        }
      }
    });

    try {
      const voicepack = await this.compiler.compile(persona);
      
      // Check that creative elements appear in lexicon
      const hasCreativeTokens = voicepack.lexicon.signature_tokens.some(token => 
        ['innovative', 'creative', 'unique', 'artistic', 'experimental'].some(creative => 
          token.toLowerCase().includes(creative)
        )
      );

      return {
        testName: 'High Openness → Creative Lexicon',
        passed: hasCreativeTokens,
        details: hasCreativeTokens 
          ? `Found creative tokens in signature_tokens: ${voicepack.lexicon.signature_tokens.join(', ')}`
          : `No creative tokens found. Tokens: ${voicepack.lexicon.signature_tokens.join(', ')}`,
        metrics: {
          openness: persona.cognitive_profile.big_five.openness,
          signature_tokens_count: voicepack.lexicon.signature_tokens.length
        }
      };
    } catch (error) {
      return {
        testName: 'High Openness → Creative Lexicon',
        passed: false,
        details: `Compilation failed: ${error.message}`
      };
    }
  }

  /**
   * Test that high neuroticism increases hedging
   */
  async testHighNeuroticismHedging(): Promise<TestResult> {
    const persona = this.createTestPersona({
      cognitive_profile: {
        ...this.createTestPersona().cognitive_profile,
        big_five: {
          ...this.createTestPersona().cognitive_profile.big_five,
          neuroticism: 0.9 // Very high
        }
      }
    });

    try {
      const voicepack = await this.compiler.compile(persona);
      
      // High neuroticism should increase hedge_rate
      const expectedMinHedgeRate = 0.4; // Higher than baseline
      const actualHedgeRate = voicepack.style_probs.hedge_rate;

      return {
        testName: 'High Neuroticism → Increased Hedging',
        passed: actualHedgeRate >= expectedMinHedgeRate,
        details: `Expected hedge_rate >= ${expectedMinHedgeRate}, got ${actualHedgeRate}`,
        metrics: {
          neuroticism: persona.cognitive_profile.big_five.neuroticism,
          hedge_rate: actualHedgeRate
        }
      };
    } catch (error) {
      return {
        testName: 'High Neuroticism → Increased Hedging',
        passed: false,
        details: `Compilation failed: ${error.message}`
      };
    }
  }

  /**
   * Test anti-mode-collapse forbidden frames are present
   */
  async testAntiModeCollapse(): Promise<TestResult> {
    const persona = this.createTestPersona();

    try {
      const voicepack = await this.compiler.compile(persona);
      
      const hasForbiddenFrames = voicepack.anti_mode_collapse.forbidden_frames.length > 0;
      const hasMustInclude = Object.keys(voicepack.anti_mode_collapse.must_include_one_of).length > 0;

      return {
        testName: 'Anti-Mode-Collapse Configuration',
        passed: hasForbiddenFrames && hasMustInclude,
        details: `Forbidden frames: ${voicepack.anti_mode_collapse.forbidden_frames.length}, Must include keys: ${Object.keys(voicepack.anti_mode_collapse.must_include_one_of).length}`,
        metrics: {
          forbidden_frames_count: voicepack.anti_mode_collapse.forbidden_frames.length,
          must_include_keys: Object.keys(voicepack.anti_mode_collapse.must_include_one_of).length
        }
      };
    } catch (error) {
      return {
        testName: 'Anti-Mode-Collapse Configuration',
        passed: false,
        details: `Compilation failed: ${error.message}`
      };
    }
  }

  /**
   * Test token count stays within limits
   */
  async testTokenLimits(): Promise<TestResult> {
    const persona = this.createTestPersona();

    try {
      const startTime = Date.now();
      const voicepack = await this.compiler.compile(persona);
      const compilationTime = Date.now() - startTime;
      
      const serialized = JSON.stringify(voicepack);
      const estimatedTokens = Math.ceil(serialized.length / 4);
      
      const withinLimits = estimatedTokens >= 350 && estimatedTokens <= 700;
      const reasonableTime = compilationTime < 5000; // 5 seconds max

      return {
        testName: 'Token Limits & Performance',
        passed: withinLimits && reasonableTime,
        details: `Estimated tokens: ${estimatedTokens} (target: 350-700), Compilation time: ${compilationTime}ms`,
        metrics: {
          estimated_tokens: estimatedTokens,
          compilation_time_ms: compilationTime,
          serialized_length: serialized.length
        }
      };
    } catch (error) {
      return {
        testName: 'Token Limits & Performance',
        passed: false,
        details: `Compilation failed: ${error.message}`
      };
    }
  }

  /**
   * Run all tests and return results
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Voicepack Test Suite...');
    
    const tests = [
      this.testHighOpennessCreativity(),
      this.testHighNeuroticismHedging(),
      this.testAntiModeCollapse(),
      this.testTokenLimits()
    ];

    const results = await Promise.all(tests);
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    console.log(`🧪 Test Suite Complete: ${passed}/${total} tests passed`);
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.details}`);
    });

    return results;
  }
}