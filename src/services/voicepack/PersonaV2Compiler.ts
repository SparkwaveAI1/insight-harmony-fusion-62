import { PersonaV2 } from '../../types/persona-v2';
import { VoicepackRuntime } from '../../types/voicepack';

export class PersonaV2Compiler {
  constructor() {
    // Updated to use direct PersonaV2 data instead of engines
  }

  /**
   * Main compilation method that transforms PersonaV2 into VoicepackRuntime
   * Now uses pre-built PersonaV2 data from the new builder system
   */
  async compile(persona: PersonaV2): Promise<VoicepackRuntime> {
    try {
      // Extract data from PersonaV2 builder outputs
      const linguistic = persona.linguistic_style;
      const stateModifiers = persona.state_modifiers;
      const traitMap = persona.trait_to_language_map;
      const cognitive = persona.cognitive_profile;
      const sexuality = persona.sexuality_profile;

      // Generate stance biases from traits
      const stanceBiases = this.generateStanceBiases(cognitive, sexuality);
      
      // Compile lexicon from linguistic style
      const lexicon = {
        signature_tokens: linguistic.syntax_and_rhythm?.signature_phrases || [],
        discourse_markers: linguistic.lexical_preferences?.hedges?.map(h => ({ term: h, p: 0.3 })) || [],
        interjections: linguistic.syntax_and_rhythm?.disfluencies?.map(d => ({ term: d, p: 0.2 })) || []
      };

      // Syntax policy from linguistic data
      const syntaxPolicy = {
        sentence_length_dist: {
          short: 0.3,
          medium: 0.5,
          long: 0.2
        },
        complexity: (linguistic.syntax_and_rhythm?.complexity === "narrative" ? "complex" : linguistic.syntax_and_rhythm?.complexity) || "compound",
        lists_per_200toks_max: linguistic.syntax_and_rhythm?.lists_frequency_per_200_tokens || 2
      };

      // Style probabilities from traits
      const styleProbabilities = {
        hedge_rate: cognitive.big_five.agreeableness,
        modal_rate: 0.4,
        definitive_rate: cognitive.big_five.conscientiousness,
        rhetorical_q_rate: 0.2,
        profanity_rate: sexuality.expression === "flamboyant" ? 0.3 : 0.1
      };

      // Response shapes from linguistic profile
      const responseShapes = linguistic.response_shapes_by_intent;

      // State hooks from state modifiers
      const stateHooks = stateModifiers.state_to_shift_rules;

      // Register rules from trait mapping
      const registerRules = traitMap.rules?.map(rule => ({
        when: { trait: rule.trait },
        shift: rule.ranges[0]?.linguistic_effects || {}
      })) || [];

      // Sexuality hooks summary
      const sexualityHooks = {
        privacy: sexuality.privacy_preference,
        disclosure: sexuality.expression === "open" ? "high" : "low",
        humor_style_bias: sexuality.hooks?.linguistic_influences?.humor_style_bias || "none"
      };

      // Anti-mode-collapse from linguistic data
      const antiModeCollapse = linguistic.anti_mode_collapse || {
        forbidden_frames: [
          "It's clear what this is about",
          "Overall pretty solid", 
          "At the end of the day"
        ],
        must_include_one_of: {
          opinion: ["perspective", "view", "thoughts"],
          advice: ["suggest", "recommend", "consider"]
        }
      };

      // Memory keys from persona memory
      const memoryKeys = persona.memory?.long_term_events?.slice(0, 5)?.map(e => e.event) || [];

      // Assemble final voicepack
      const voicepack: VoicepackRuntime = {
        stance_biases: stanceBiases,
        response_shapes: responseShapes,
        lexicon,
        syntax_policy: syntaxPolicy,
        style_probs: styleProbabilities,
        register_rules: registerRules,
        state_hooks: stateHooks,
        sexuality_hooks_summary: sexualityHooks,
        anti_mode_collapse: antiModeCollapse,
        topic_salience: stanceBiases, // alias for backwards compatibility
        memory_keys: memoryKeys
      };

      return this.validateAndOptimize(voicepack);
    } catch (error) {
      console.error('PersonaV2Compiler error:', error);
      throw new Error(`Compilation failed: ${error.message}`);
    }
  }

  /**
   * Generate stance biases from cognitive and sexuality profiles
   */
  private generateStanceBiases(cognitive: PersonaV2['cognitive_profile'], sexuality: PersonaV2['sexuality_profile']) {
    const biases = [
      { topic: "technology", w: cognitive.big_five.openness },
      { topic: "relationships", w: sexuality.importance_in_identity / 10 },
      { topic: "politics", w: cognitive.moral_foundations.authority_subversion },
      { topic: "creativity", w: cognitive.big_five.openness },
      { topic: "tradition", w: 1 - cognitive.big_five.openness },
      { topic: "social_justice", w: cognitive.moral_foundations.fairness_cheating }
    ];

    // Normalize weights to sum to 1
    const total = biases.reduce((sum, b) => sum + b.w, 0);
    return biases.map(b => ({ ...b, w: b.w / total }));
  }

  /**
   * Validate the compiled voicepack and optimize for size
   */
  private validateAndOptimize(voicepack: VoicepackRuntime): VoicepackRuntime {
    // Ensure token count stays within limits (350-700 tokens)
    const serialized = JSON.stringify(voicepack);
    const estimatedTokens = Math.ceil(serialized.length / 4); // rough token estimation

    if (estimatedTokens > 700) {
      console.warn(`Voicepack exceeds token limit: ${estimatedTokens} tokens`);
      // Trim less critical elements if needed
      voicepack.lexicon.signature_tokens = voicepack.lexicon.signature_tokens.slice(0, 20);
      voicepack.anti_mode_collapse.forbidden_frames = voicepack.anti_mode_collapse.forbidden_frames.slice(0, 8);
    }

    return voicepack;
  }
}