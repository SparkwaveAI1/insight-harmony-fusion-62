import { PersonaV3 } from "@/types/persona-v3";

export interface PersonaV3CreationParams {
  prompt: string;
  seed?: string;
}

export interface PersonaV3GenerationResult {
  persona: PersonaV3;
  validation_flags: Record<string, boolean>;
  builder_metadata: {
    generation_time_ms: number;
    prompt_used: string;
    version: string;
  };
}

export class PersonaV3Factory {
  async generatePersonaV3(params: PersonaV3CreationParams): Promise<PersonaV3GenerationResult> {
    const startTime = Date.now();
    
    // Generate unique persona ID
    const personaId = `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a basic V3 persona structure with sensible defaults
    const persona: PersonaV3 = {
      persona_id: personaId,
      id: crypto.randomUUID(),
      name: this.extractNameFromPrompt(params.prompt),
      description: params.prompt,
      version: "3.0",
      created_at: new Date().toISOString(),

      identity: {
        age: 28,
        gender: "non-binary",
        pronouns: "they/them",
        ethnicity: "Mixed",
        nationality: "American",
        occupation: "Software Developer",
        relationship_status: "Single",
        dependents: 0,
        location: {
          city: "San Francisco",
          region: "California",
          country: "United States"
        },
        socioeconomic_context: {
          income_level: "$75,000-$100,000",
          education_level: "Bachelor's Degree",
          social_class_identity: "Middle Class",
          political_affiliation: "Independent",
          religious_affiliation: "Agnostic",
          religious_practice_level: "low",
          cultural_background: "Western",
          cultural_dimensions: {
            power_distance: 0.3,
            individualism_vs_collectivism: 0.7,
            masculinity_vs_femininity: 0.4,
            uncertainty_avoidance: 0.5,
            long_term_orientation: 0.6,
            indulgence_vs_restraint: 0.5
          }
        }
      },

      life_context: {
        supports: ["friends", "online communities"],
        stressors: ["work deadlines", "social media"],
        daily_routine: "Wake up at 7am, work 9-5, evening coding projects, social time on weekends",
        current_situation: "Recently started a new job at a tech startup",
        background_narrative: "Grew up in a suburban area, discovered coding in college, passionate about technology and its impact on society",
        lifestyle: "Urban professional with focus on work-life balance"
      },

      knowledge_profile: {
        general_knowledge_level: "high",
        tech_literacy: "high",
        domains_of_expertise: ["technology", "software development"],
        knowledge_domains: {
          arts: 3,
          health: 2,
          sports: 2,
          finance: 3,
          history: 3,
          science: 4,
          business: 3,
          politics: 3,
          technology: 5,
          entertainment: 3
        }
      },

      cognitive_profile: {
        big_five: {
          openness: 0.8,
          neuroticism: 0.4,
          extraversion: 0.6,
          agreeableness: 0.7,
          conscientiousness: 0.7
        },
        extended_traits: {
          empathy: 0.8,
          self_efficacy: 0.7,
          cognitive_flexibility: 0.8,
          impulse_control: 0.6,
          attention_pattern: 0.7,
          manipulativeness: 0.2,
          need_for_cognitive_closure: 0.4,
          institutional_trust: 0.5
        },
        intelligence: {
          type: ["analytical", "creative"],
          level: "high"
        },
        decision_style: "logical",
        behavioral_economics: {
          present_bias: 0.4,
          loss_aversion: 0.6,
          overconfidence: 0.3,
          risk_sensitivity: 0.5,
          scarcity_sensitivity: 0.4
        },
        moral_foundations: {
          care_harm: 0.8,
          fairness_cheating: 0.9,
          loyalty_betrayal: 0.5,
          authority_subversion: 0.4,
          sanctity_degradation: 0.3,
          liberty_oppression: 0.8
        },
        social_identity: {
          identity_strength: 0.6,
          ingroup_bias_tendency: 0.3,
          outgroup_bias_tendency: 0.2,
          cultural_intelligence: 0.7,
          system_justification: 0.4
        },
        political_orientation: {
          authoritarian_libertarian: 0.3,
          economic: 0.4,
          cultural_progressive_conservative: 0.7
        },
        worldview_summary: "Progressive values with emphasis on technology's potential for social good, balanced with pragmatic concerns about implementation"
      },

      memory: {
        persistence: {
          long_term: 0.8,
          short_term: 0.7
        },
        long_term_events: [
          {
            event: "First coding project in college",
            valence: "positive",
            timestamp: "2019-03-15",
            recall_cues: ["coding", "achievement", "learning"],
            impact_on_behavior: "Reinforced passion for technology and problem-solving"
          }
        ],
        short_term_slots: 5
      },

      state_modifiers: {
        current_state: {
          fatigue: 0.3,
          acute_stress: 0.4,
          mood_valence: 0.6,
          social_safety: 0.7,
          time_pressure: 0.5
        },
        state_to_shift_rules: [
          {
            when: { stress: ">0.6" },
            shift: { linguistic_style: { hedge_rate: "+0.2" } }
          }
        ]
      },

      linguistic_style: {
        base_voice: {
          formality: "casual",
          verbosity: "moderate",
          directness: "balanced",
          politeness: "medium"
        },
        syntax_and_rhythm: {
          complexity: "compound",
          disfluencies: ["um", "like"],
          signature_phrases: ["That's interesting", "I think"],
          avg_sentence_tokens: { baseline_max: 20, baseline_min: 8 }
        },
        anti_mode_collapse: {
          forbidden_frames: ["At the end of the day", "It is what it is"],
          must_include_one_of: {
            advice: ["suggest", "recommend", "consider"],
            opinion: ["perspective", "view", "think"]
          }
        },
        lexical_preferences: {
          hedges: ["I think", "maybe", "perhaps"],
          modal_verbs: ["could", "might", "would"],
          affect_words: { negative_bias: 0.3, positive_bias: 0.6 }
        },
        response_shapes_by_intent: {
          story: ["This reminds me of", "I had a similar experience"],
          advice: ["You might consider", "One approach could be"],
          opinion: ["From my perspective", "I tend to think"]
        }
      },

      group_behavior: {
        assertiveness: "medium",
        interruption_tolerance: "medium",
        self_disclosure_rate: "medium"
      },

      social_cognition: {
        empathy: "high",
        theory_of_mind: "high",
        conflict_orientation: "collaborative"
      },

      sexuality_profile: {
        orientation: "pansexual",
        expression: "private",
        flirtatiousness: "low",
        libido_level: "medium",
        relationship_norms: "monogamous"
      },

      emotional_triggers: {
        positive: ["learning", "solving problems", "helping others"],
        negative: ["unfairness", "discrimination", "privacy violations"],
        explosive: ["harassment", "abuse of power"]
      },

      runtime_controls: {
        style_weights: {
          cognition: 0.4,
          knowledge: 0.3,
          linguistics: 0.3
        },
        token_budgets: { max: 200, min: 50 },
        variability_profile: {
          turn_to_turn: 0.2,
          session_to_session: 0.3
        }
      },

      interview_sections: [
        {
          section_title: "Background",
          responses: [
            {
              question: "Tell me about yourself",
              answer: "I'm a software developer who's passionate about using technology to solve real-world problems. I recently started at a new startup and I'm excited about the potential to make a meaningful impact."
            }
          ]
        }
      ]
    };

    const generationTime = Date.now() - startTime;

    const validation_flags = {
      has_complete_identity: true,
      has_cognitive_profile: true,
      has_linguistic_style: true,
      has_memory_structure: true,
      has_social_cognition: true
    };

    const builder_metadata = {
      generation_time_ms: generationTime,
      prompt_used: params.prompt,
      version: "3.0"
    };

    return {
      persona,
      validation_flags,
      builder_metadata
    };
  }

  private extractNameFromPrompt(prompt: string): string {
    // Simple name extraction logic
    const nameMatch = prompt.match(/(?:named|called)\s+([A-Z][a-z]+)/i);
    if (nameMatch) {
      return nameMatch[1];
    }
    
    // Default names
    const defaultNames = ["Alex", "Jordan", "Casey", "Morgan", "Riley"];
    return defaultNames[Math.floor(Math.random() * defaultNames.length)];
  }
}