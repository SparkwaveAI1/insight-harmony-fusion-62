import { PersonaV2 } from '../../types/persona-v2';
import { buildIdentity } from './builders/identityBuilder';
import { buildCognitiveProfile } from './builders/cognitiveBuilder';
import { buildKnowledgeProfile } from './builders/knowledgeBuilder';
import { buildLinguisticProfile } from './builders/linguisticBuilder';
import { buildStateProfile } from './builders/stateBuilder';
import { buildTraitToLanguageMap } from './builders/traitMapBuilder';
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
        prompt: options.prompt,
        seed: `${seed}_cognitive`
      });

      // Stage 3: Knowledge Profile  
      const knowledgeResult = buildKnowledgeProfile({
        identity: identityResult.identity,
        cognitive: cognitiveResult.cognitive_profile,
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
        life_context: cognitiveResult.life_context,
        seed: `${seed}_state`
      });

      // Stage 6: Trait-to-Language Mapping
      const traitMapResult = buildTraitToLanguageMap({
        identity: identityResult.identity,
        cognitive: cognitiveResult.cognitive_profile,
        social: cognitiveResult.social_cognition,
        health: cognitiveResult.health_profile,
        sexuality: cognitiveResult.sexuality_profile,
        seed: `${seed}_traitmap`
      });

      // Stage 7: Runtime Controls
      const runtimeResult = buildRuntimeControls({
        cognitive: cognitiveResult.cognitive_profile,
        linguistic: linguisticResult.linguistic_profile,
        state: stateResult.state_hooks,
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
        life_context: cognitiveResult.life_context,
        cognitive_profile: cognitiveResult.cognitive_profile,
        social_cognition: cognitiveResult.social_cognition,
        health_profile: cognitiveResult.health_profile,
        sexuality_profile: cognitiveResult.sexuality_profile,
        knowledge_profile: knowledgeResult.knowledge_profile,
        emotional_triggers: knowledgeResult.emotional_triggers,
        contradictions: knowledgeResult.contradictions,
        memory: knowledgeResult.memory,
        
        // Enhanced builder outputs
        linguistic_style: linguisticResult.linguistic_profile,
        state_modifiers: {
          current_state: stateResult.baseline_state,
          state_to_shift_rules: stateResult.state_hooks
        },
        trait_to_language_map: traitMapResult.trait_to_language_map,
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
        reasoning_modifiers: runtimeResult.reasoning_modifiers,
        runtime_controls: runtimeResult.runtime_controls,
        ethics_and_safety: runtimeResult.ethics_and_safety,
        telemetry: runtimeResult.telemetry
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