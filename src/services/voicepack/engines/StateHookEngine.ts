import { PersonaV2 } from '../../../types/persona-v2';

export class StateHookEngine {
  /**
   * Compile state hooks from PersonaV2 state modifiers
   */
  compileStateHooks(persona: PersonaV2): Record<string, Record<string, number | string>> {
    const stateHooks: Record<string, Record<string, number | string>> = {};
    
    // Extract state-to-shift rules from PersonaV2
    const stateRules = persona.state_modifiers?.state_to_shift_rules || [];
    
    stateRules.forEach(rule => {
      const condition = Object.keys(rule.when)[0];
      if (condition && rule.shift) {
        stateHooks[condition] = this.normalizeShiftDeltas(rule.shift);
      }
    });

    // Add default stress patterns based on neuroticism
    const neuroticism = persona.cognitive_profile?.big_five?.neuroticism || 0.5;
    if (neuroticism > 0.6) {
      stateHooks["stress>0.6"] = {
        hedge_rate: "+0.2",
        sentence_length_pct: "-15",
        definitive_rate: "-0.1"
      };
    }

    // Add fatigue patterns
    stateHooks["fatigue>0.7"] = {
      hedge_rate: "+0.1",
      modal_rate: "+0.15",
      avg_sentence_tokens: "-3"
    };

    // Add sexuality-based state modifications
    const sexuality = persona.sexuality_profile;
    if (sexuality && sexuality.privacy_preference !== "private") {
      stateHooks["sexual_tension>0.5"] = {
        directness: "+1",
        humor_rate: "+0.1",
        self_disclosure_rate: "step_up"
      };
    }

    return stateHooks;
  }

  /**
   * Compile register rules for different audiences
   */
  compileRegisterRules(persona: PersonaV2): Array<{ when: Record<string, string>; shift: Record<string, string | number> }> {
    const rules: Array<{ when: Record<string, string>; shift: Record<string, string | number> }> = [];
    
    // Extract accommodation rules from group behavior
    const accommodationRules = persona.group_behavior?.focus_group_modifiers?.accommodation_rules || [];
    
    accommodationRules.forEach(rule => {
      rules.push({
        when: { audience: rule.audience },
        shift: rule.shift
      });
    });

    // Add default register adaptations
    const deference = persona.group_behavior?.focus_group_modifiers?.deference_to_authority || "medium";
    
    if (deference === "high") {
      rules.push({
        when: { audience: "authority" },
        shift: { formality: "high", hedge_rate: "+0.2", directness: "-1" }
      });
    }

    // Add expertise-based adaptations
    const domains = persona.knowledge_profile?.domains_of_expertise || [];
    if (domains.length > 0) {
      rules.push({
        when: { topic_match: domains[0] },
        shift: { confidence_level: "+0.3", jargon_rate: "+0.2" }
      });
    }

    return rules;
  }

  /**
   * Compile sexuality hooks summary
   */
  compileSexualityHooks(persona: PersonaV2) {
    const sexuality = persona.sexuality_profile;
    
    if (!sexuality) {
      return {
        privacy: "private" as const,
        disclosure: "low" as const,
        humor_style_bias: "none"
      };
    }

    // Map sexuality expression to privacy levels
    const privacyMap: Record<string, "private" | "selective" | "open"> = {
      "private": "private",
      "discreet": "private", 
      "conservative": "selective",
      "open": "open",
      "flamboyant": "open",
      "exploratory": "selective"
    };

    // Map relationship norms to disclosure patterns
    const disclosureMap: Record<string, "low" | "medium" | "high"> = {
      "monogamous": "low",
      "serial_monogamy": "low",
      "casual": "medium",
      "open": "high",
      "polyamorous": "high"
    };

    const privacy = privacyMap[sexuality.expression] || "selective";
    const disclosure = disclosureMap[sexuality.relationship_norms] || "low";
    
    // Determine humor style bias from sexuality hooks
    let humorBias = "none";
    if (sexuality.hooks?.linguistic_influences?.humor_style_bias) {
      humorBias = sexuality.hooks.linguistic_influences.humor_style_bias;
    } else if (sexuality.flirtatiousness === "high") {
      humorBias = "flirtatious";
    }

    return {
      privacy,
      disclosure, 
      humor_style_bias: humorBias
    };
  }

  /**
   * Normalize shift deltas to consistent format
   */
  private normalizeShiftDeltas(shift: any): Record<string, number | string> {
    const normalized: Record<string, number | string> = {};
    
    // Handle nested linguistic style deltas
    if (shift.linguistic_style?.delta) {
      Object.entries(shift.linguistic_style.delta).forEach(([key, value]) => {
        if (typeof value === "number") {
          normalized[key] = value > 0 ? `+${value}` : `${value}`;
        } else {
          normalized[key] = value as string;
        }
      });
    }

    // Handle direct shift properties
    Object.entries(shift).forEach(([key, value]) => {
      if (key !== "linguistic_style" && key !== "reasoning_modifiers") {
        normalized[key] = value as string | number;
      }
    });

    return normalized;
  }
}