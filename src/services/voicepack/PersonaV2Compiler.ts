import { PersonaV2 } from '../../types/persona-v2';
import { VoicepackRuntime } from '../../types/voicepack';
import { TraitSynthesisEngine } from './engines/TraitSynthesisEngine';
import { LinguisticCompiler } from './engines/LinguisticCompiler';
import { StateHookEngine } from './engines/StateHookEngine';
import { SignatureEngine } from './engines/SignatureEngine';

export class PersonaV2Compiler {
  private traitEngine: TraitSynthesisEngine;
  private linguisticCompiler: LinguisticCompiler;
  private stateEngine: StateHookEngine;
  private signatureEngine: SignatureEngine;

  constructor() {
    this.traitEngine = new TraitSynthesisEngine();
    this.linguisticCompiler = new LinguisticCompiler();
    this.stateEngine = new StateHookEngine();
    this.signatureEngine = new SignatureEngine();
  }

  /**
   * Main compilation method that transforms PersonaV2 into VoicepackRuntime
   */
  async compile(persona: PersonaV2): Promise<VoicepackRuntime> {
    try {
      // Stage 1: Trait Analysis & Stance Generation
      const stanceBiases = this.traitEngine.generateStanceBiases(persona);
      const styleProbabilities = this.traitEngine.generateStyleProbabilities(persona);

      // Stage 2: Linguistic Profile Compilation
      const lexicon = await this.linguisticCompiler.compileLexicon(persona);
      const syntaxPolicy = this.linguisticCompiler.compileSyntaxPolicy(persona);
      const responseShapes = this.linguisticCompiler.compileResponseShapes(persona);

      // Stage 3: State & Context Management
      const stateHooks = this.stateEngine.compileStateHooks(persona);
      const registerRules = this.stateEngine.compileRegisterRules(persona);
      const sexualityHooks = this.stateEngine.compileSexualityHooks(persona);

      // Stage 4: Anti-Mode-Collapse System
      const antiModeCollapse = await this.signatureEngine.compileAntiModeCollapse(persona);
      const memoryKeys = this.signatureEngine.extractMemoryKeys(persona);

      // Stage 5: Assemble final voicepack
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