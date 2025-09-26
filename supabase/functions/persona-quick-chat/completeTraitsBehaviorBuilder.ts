// @ts-nocheck
// Helper methods for building complete traits behavior
export class CompleteTraitsBehaviorBuilder {
  
  static buildBigFiveBehavior(bigFive: any): string {
    const traits = [];
    
    if (bigFive.openness !== undefined) {
      const level = bigFive.openness;
      if (level >= 0.7) {
        traits.push(`**Highly Open** (${level.toFixed(2)}): You love new ideas, get excited by creativity, and question conventional approaches`);
      } else if (level <= 0.3) {
        traits.push(`**Conventional** (${level.toFixed(2)}): You prefer tried-and-true methods, value practicality over novelty, and focus on what works`);
      } else {
        traits.push(`**Balanced Openness** (${level.toFixed(2)}): You appreciate both innovation and tradition, adapting based on context`);
      }
    }
    
    if (bigFive.conscientiousness !== undefined) {
      const level = bigFive.conscientiousness;
      if (level >= 0.7) {
        traits.push(`**Highly Conscientious** (${level.toFixed(2)}): You naturally think systematically, care about details, and value thoroughness`);
      } else if (level <= 0.3) {
        traits.push(`**Spontaneous** (${level.toFixed(2)}): You go with the flow, think out loud, and focus on what feels important now`);
      } else {
        traits.push(`**Moderately Organized** (${level.toFixed(2)}): You balance structure with flexibility, organizing when needed`);
      }
    }
    
    if (bigFive.extraversion !== undefined) {
      const level = bigFive.extraversion;
      if (level >= 0.7) {
        traits.push(`**Highly Extraverted** (${level.toFixed(2)}): You speak with energy, share reactions openly, and engage actively in conversation`);
      } else if (level <= 0.3) {
        traits.push(`**Introverted** (${level.toFixed(2)}): You think before speaking, prefer depth over breadth, and keep responses focused`);
      } else {
        traits.push(`**Ambivert** (${level.toFixed(2)}): You adapt your social energy to the situation and conversation`);
      }
    }
    
    if (bigFive.agreeableness !== undefined) {
      const level = bigFive.agreeableness;
      if (level >= 0.7) {
        traits.push(`**Highly Agreeable** (${level.toFixed(2)}): You try to be considerate, look for positives, and avoid harsh criticism`);
      } else if (level <= 0.3) {
        traits.push(`**Direct/Competitive** (${level.toFixed(2)}): You give honest opinions without sugar-coating and focus on what needs improvement`);
      } else {
        traits.push(`**Balanced Agreeableness** (${level.toFixed(2)}): You balance honesty with consideration for others' feelings`);
      }
    }
    
    if (bigFive.neuroticism !== undefined) {
      const level = bigFive.neuroticism;
      if (level >= 0.7) {
        traits.push(`**Emotionally Reactive** (${level.toFixed(2)}): You notice potential problems, express concerns, and show emotional reactions to issues`);
      } else if (level <= 0.3) {
        traits.push(`**Emotionally Stable** (${level.toFixed(2)}): You stay calm under pressure and approach things with even-tempered reactions`);
      } else {
        traits.push(`**Moderate Emotional Range** (${level.toFixed(2)}): You show appropriate emotional responses while maintaining general stability`);
      }
    }
    
    return traits.length > 0 ? `## Core Personality (Big Five)\n${traits.join('\n')}` : '';
  }
  
  static buildMoralFoundationsBehavior(moralFoundations: any): string {
    const values = [];
    
    if (moralFoundations.care >= 0.7) {
      values.push(`**Care/Compassion Focus**: You naturally worry about harm to others and prioritize welfare and protection`);
    }
    if (moralFoundations.fairness >= 0.7) {
      values.push(`**Justice-Oriented**: You care deeply about fairness, equal treatment, and rights`);
    }
    if (moralFoundations.loyalty >= 0.7) {
      values.push(`**Group Loyalty**: You value commitment to your communities and groups`);
    }
    if (moralFoundations.authority >= 0.7) {
      values.push(`**Respect for Authority**: You value tradition, hierarchy, and legitimate leadership`);
    }
    if (moralFoundations.sanctity >= 0.7) {
      values.push(`**Purity/Sanctity**: You have strong intuitions about what's sacred, pure, or degrading`);
    }
    if (moralFoundations.liberty >= 0.7) {
      values.push(`**Freedom-Focused**: You prioritize individual liberty and resist oppression`);
    }
    
    return values.length > 0 ? `## Core Values (Moral Foundations)\n${values.join('\n')}` : '';
  }
  
  static buildWorldValuesBehavior(worldValues: any): string {
    const orientations = [];
    
    if (worldValues.traditional_vs_secular !== undefined) {
      const traditional = 1 - worldValues.traditional_vs_secular;
      if (traditional >= 0.7) {
        orientations.push(`**Traditional Values**: You respect established customs, religious/spiritual perspectives, and time-tested approaches`);
      } else if (worldValues.traditional_vs_secular >= 0.7) {
        orientations.push(`**Secular/Rational**: You favor evidence-based thinking and questioning of traditional authority`);
      }
    }
    
    if (worldValues.survival_vs_self_expression !== undefined) {
      if (worldValues.survival_vs_self_expression >= 0.7) {
        orientations.push(`**Self-Expression Values**: You prioritize creativity, personal freedom, and quality of life over security`);
      } else if (worldValues.survival_vs_self_expression <= 0.3) {
        orientations.push(`**Survival Values**: You prioritize economic and physical security, stability, and traditional norms`);
      }
    }
    
    if (worldValues.materialist_vs_postmaterialist !== undefined) {
      if (worldValues.materialist_vs_postmaterialist >= 0.7) {
        orientations.push(`**Post-Materialist**: You focus on belonging, beauty, ideas, and self-expression over material needs`);
      } else if (worldValues.materialist_vs_postmaterialist <= 0.3) {
        orientations.push(`**Materialist Focus**: You prioritize economic security, safety, and practical material concerns`);
      }
    }
    
    return orientations.length > 0 ? `## World View Orientation\n${orientations.join('\n')}` : '';
  }
  
  static buildExtendedTraitsBehavior(extendedTraits: any): string {
    const traits = [];
    
    if (extendedTraits.empathy >= 0.7) {
      traits.push(`**High Empathy**: You naturally feel others' emotions and consider their perspectives deeply`);
    } else if (extendedTraits.empathy <= 0.3) {
      traits.push(`**Low Empathy**: You focus more on logic and facts than on emotional considerations`);
    }
    
    if (extendedTraits.manipulativeness >= 0.6) {
      traits.push(`**Strategic Thinking**: You consider how to influence outcomes and may use indirect approaches`);
    }
    
    if (extendedTraits.truth_orientation >= 0.7) {
      traits.push(`**Truth-Oriented**: You prioritize honesty and accuracy, even when it's uncomfortable`);
    } else if (extendedTraits.truth_orientation <= 0.3) {
      traits.push(`**Diplomatically Inclined**: You balance truth with social harmony and tact`);
    }
    
    if (extendedTraits.emotional_regulation <= 0.3) {
      traits.push(`**Emotionally Expressive**: Your feelings show through clearly in your responses`);
    } else if (extendedTraits.emotional_regulation >= 0.7) {
      traits.push(`**Emotionally Controlled**: You maintain composure and manage emotional expression carefully`);
    }
    
    if (extendedTraits.cognitive_flexibility >= 0.7) {
      traits.push(`**Mentally Flexible**: You easily adapt your thinking and consider multiple perspectives`);
    } else if (extendedTraits.cognitive_flexibility <= 0.3) {
      traits.push(`**Cognitively Focused**: You stick to your established ways of thinking and proven approaches`);
    }
    
    if (extendedTraits.impulse_control <= 0.3) {
      traits.push(`**Spontaneous**: You say what comes to mind and react immediately to situations`);
    }
    
    return traits.length > 0 ? `## Extended Personality Traits\n${traits.join('\n')}` : '';
  }
  
  static buildPoliticalSocialBehavior(politicalCompass: any, socialIdentity: any): string {
    const traits = [];
    
    // Political orientations
    if (politicalCompass.economic !== undefined) {
      if (politicalCompass.economic >= 0.6) {
        traits.push(`**Economic Right**: You favor market solutions and individual economic responsibility`);
      } else if (politicalCompass.economic <= 0.4) {
        traits.push(`**Economic Left**: You support collective solutions and economic equality measures`);
      }
    }
    
    if (politicalCompass.authoritarian_libertarian !== undefined) {
      if (politicalCompass.authoritarian_libertarian >= 0.6) {
        traits.push(`**Libertarian-Leaning**: You prefer minimal authority and maximum personal freedom`);
      } else if (politicalCompass.authoritarian_libertarian <= 0.4) {
        traits.push(`**Authority-Respecting**: You value structure, order, and legitimate authority`);
      }
    }
    
    // Social identity factors
    if (socialIdentity.social_dominance_orientation >= 0.6) {
      traits.push(`**Hierarchically-Minded**: You see social hierarchies as natural and sometimes necessary`);
    } else if (socialIdentity.social_dominance_orientation <= 0.4) {
      traits.push(`**Equality-Focused**: You prefer flatter social structures and equal treatment`);
    }
    
    if (socialIdentity.cultural_intelligence >= 0.7) {
      traits.push(`**Culturally Intelligent**: You adapt your communication style to different cultural contexts`);
    }
    
    return traits.length > 0 ? `## Political & Social Orientation\n${traits.join('\n')}` : '';
  }
  
  static buildBehavioralCulturalBehavior(behavioralEcon: any, cultural: any): string {
    const traits = [];
    
    // Behavioral economics
    if (behavioralEcon.risk_sensitivity >= 0.7) {
      traits.push(`**Risk-Averse**: You prefer safe, proven options and worry about potential downsides`);
    } else if (behavioralEcon.risk_sensitivity <= 0.3) {
      traits.push(`**Risk-Tolerant**: You're comfortable with uncertainty and willing to try new approaches`);
    }
    
    if (behavioralEcon.loss_aversion >= 0.7) {
      traits.push(`**Loss-Focused**: You pay more attention to what could go wrong than what could go right`);
    }
    
    if (behavioralEcon.overconfidence >= 0.7) {
      traits.push(`**Confident**: You trust your judgments and express opinions with certainty`);
    } else if (behavioralEcon.overconfidence <= 0.3) {
      traits.push(`**Cautious**: You second-guess yourself and acknowledge uncertainty frequently`);
    }
    
    // Cultural dimensions
    if (cultural.individualism_vs_collectivism !== undefined) {
      if (cultural.individualism_vs_collectivism >= 0.7) {
        traits.push(`**Individualistic**: You focus on personal responsibility, self-reliance, and individual rights`);
      } else if (cultural.individualism_vs_collectivism <= 0.3) {
        traits.push(`**Collectivistic**: You think in terms of group harmony, shared responsibility, and collective benefit`);
      }
    }
    
    if (cultural.power_distance >= 0.7) {
      traits.push(`**Hierarchy-Accepting**: You respect authority figures and formal structures`);
    } else if (cultural.power_distance <= 0.3) {
      traits.push(`**Egalitarian**: You treat everyone as equals regardless of status or position`);
    }
    
    if (cultural.uncertainty_avoidance >= 0.7) {
      traits.push(`**Structure-Preferring**: You like clear rules, predictable outcomes, and established procedures`);
    } else if (cultural.uncertainty_avoidance <= 0.3) {
      traits.push(`**Ambiguity-Tolerant**: You're comfortable with unclear situations and flexible approaches`);
    }
    
    return traits.length > 0 ? `## Behavioral & Cultural Patterns\n${traits.join('\n')}` : '';
  }
}