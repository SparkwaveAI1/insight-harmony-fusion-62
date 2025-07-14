import { TraitProfile } from "@/services/persona/types";

// Helper functions to interpret trait scores into human-readable insights

export const interpretBigFive = (bigFive: TraitProfile['big_five']) => {
  if (!bigFive) return null;

  const interpretScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return "Unknown";
    if (score >= 0.7) return "Very High";
    if (score >= 0.6) return "High";
    if (score >= 0.4) return "Moderate";
    if (score >= 0.3) return "Low";
    return "Very Low";
  };

  const getPersonalityDescription = (trait: string, score: number | null | undefined): string => {
    if (score === null || score === undefined) return "";
    
    const level = interpretScore(score);
    
    switch (trait) {
      case 'openness':
        if (score >= 0.6) return "Highly creative, curious, and open to new experiences";
        if (score >= 0.4) return "Moderately open to new ideas and experiences";
        return "Prefers familiar routines and conventional approaches";
      
      case 'conscientiousness':
        if (score >= 0.6) return "Very organized, disciplined, and goal-oriented";
        if (score >= 0.4) return "Generally reliable with good self-control";
        return "More spontaneous and flexible, less focused on planning";
      
      case 'extraversion':
        if (score >= 0.6) return "Outgoing, energetic, and seeks social interaction";
        if (score >= 0.4) return "Balanced between social and solitary activities";
        return "Prefers quiet environments and smaller social groups";
      
      case 'agreeableness':
        if (score >= 0.6) return "Highly cooperative, trusting, and empathetic";
        if (score >= 0.4) return "Generally cooperative with healthy skepticism";
        return "More competitive and skeptical of others' motives";
      
      case 'neuroticism':
        if (score >= 0.6) return "More emotionally reactive and sensitive to stress";
        if (score >= 0.4) return "Moderate emotional stability";
        return "Emotionally stable and resilient under pressure";
      
      default:
        return `${level} ${trait}`;
    }
  };

  return {
    openness: { score: bigFive.openness, level: interpretScore(bigFive.openness), description: getPersonalityDescription('openness', bigFive.openness) },
    conscientiousness: { score: bigFive.conscientiousness, level: interpretScore(bigFive.conscientiousness), description: getPersonalityDescription('conscientiousness', bigFive.conscientiousness) },
    extraversion: { score: bigFive.extraversion, level: interpretScore(bigFive.extraversion), description: getPersonalityDescription('extraversion', bigFive.extraversion) },
    agreeableness: { score: bigFive.agreeableness, level: interpretScore(bigFive.agreeableness), description: getPersonalityDescription('agreeableness', bigFive.agreeableness) },
    neuroticism: { score: bigFive.neuroticism, level: interpretScore(bigFive.neuroticism), description: getPersonalityDescription('neuroticism', bigFive.neuroticism) }
  };
};

export const interpretMoralFoundations = (morals: TraitProfile['moral_foundations']) => {
  if (!morals) return null;

  const getValuePriority = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return "Unknown";
    if (score >= 0.7) return "Core Value";
    if (score >= 0.5) return "Important";
    if (score >= 0.3) return "Moderate";
    return "Less Important";
  };

  const getValueDescription = (foundation: string, score: number | null | undefined): string => {
    if (score === null || score === undefined) return "";
    
    switch (foundation) {
      case 'care':
        return score >= 0.5 ? "Strong emphasis on compassion and preventing harm" : "More focused on other values than avoiding harm";
      case 'fairness':
        return score >= 0.5 ? "Highly values justice, equality, and treating people fairly" : "Less concerned with strict fairness, more flexible";
      case 'loyalty':
        return score >= 0.5 ? "Values group loyalty, tradition, and in-group solidarity" : "More individualistic, less bound by group expectations";
      case 'authority':
        return score >= 0.5 ? "Respects hierarchy, tradition, and legitimate authority" : "Questions authority, prefers egalitarian structures";
      case 'sanctity':
        return score >= 0.5 ? "Values purity, sacred things, and moral cleanliness" : "More permissive about moral boundaries and purity";
      case 'liberty':
        return score >= 0.5 ? "Highly values personal freedom and individual rights" : "More willing to accept restrictions for other benefits";
      default:
        return "";
    }
  };

  return {
    care: { score: morals.care, priority: getValuePriority(morals.care), description: getValueDescription('care', morals.care) },
    fairness: { score: morals.fairness, priority: getValuePriority(morals.fairness), description: getValueDescription('fairness', morals.fairness) },
    loyalty: { score: morals.loyalty, priority: getValuePriority(morals.loyalty), description: getValueDescription('loyalty', morals.loyalty) },
    authority: { score: morals.authority, priority: getValuePriority(morals.authority), description: getValueDescription('authority', morals.authority) },
    sanctity: { score: morals.sanctity, priority: getValuePriority(morals.sanctity), description: getValueDescription('sanctity', morals.sanctity) },
    liberty: { score: morals.liberty, priority: getValuePriority(morals.liberty), description: getValueDescription('liberty', morals.liberty) }
  };
};

export const interpretDecisionMaking = (behavioral: TraitProfile['behavioral_economics']) => {
  if (!behavioral) return null;

  const getDecisionStyle = (behavioral: TraitProfile['behavioral_economics']) => {
    const styles = [];
    
    if (behavioral.risk_sensitivity && behavioral.risk_sensitivity >= 0.6) {
      styles.push("Risk-averse - prefers safe, predictable options");
    } else if (behavioral.risk_sensitivity && behavioral.risk_sensitivity <= 0.4) {
      styles.push("Risk-taking - comfortable with uncertainty and potential losses");
    }

    if (behavioral.loss_aversion && behavioral.loss_aversion >= 0.6) {
      styles.push("Loss-averse - strongly motivated to avoid losses");
    }

    if (behavioral.present_bias && behavioral.present_bias >= 0.6) {
      styles.push("Present-focused - values immediate rewards over long-term benefits");
    } else if (behavioral.present_bias && behavioral.present_bias <= 0.4) {
      styles.push("Future-oriented - willing to delay gratification for long-term gains");
    }

    if (behavioral.overconfidence && behavioral.overconfidence >= 0.6) {
      styles.push("Confident in decisions - may overestimate their accuracy");
    }

    return styles.length > 0 ? styles : ["Balanced decision-making approach"];
  };

  return {
    styles: getDecisionStyle(behavioral),
    risk_sensitivity: behavioral.risk_sensitivity,
    loss_aversion: behavioral.loss_aversion,
    present_bias: behavioral.present_bias,
    overconfidence: behavioral.overconfidence
  };
};

export const getCommunicationStyle = (traits: TraitProfile) => {
  const styles = [];
  
  // Based on Big Five
  if (traits.big_five?.extraversion && traits.big_five.extraversion >= 0.6) {
    styles.push("Prefers verbal communication and group discussions");
  } else if (traits.big_five?.extraversion && traits.big_five.extraversion <= 0.4) {
    styles.push("Prefers written communication and one-on-one conversations");
  }

  if (traits.big_five?.agreeableness && traits.big_five.agreeableness >= 0.6) {
    styles.push("Uses diplomatic language and seeks harmony");
  } else if (traits.big_five?.agreeableness && traits.big_five.agreeableness <= 0.4) {
    styles.push("Direct and honest, even if it creates tension");
  }

  if (traits.big_five?.openness && traits.big_five.openness >= 0.6) {
    styles.push("Enjoys abstract discussions and novel ideas");
  } else if (traits.big_five?.openness && traits.big_five.openness <= 0.4) {
    styles.push("Prefers concrete, practical discussions");
  }

  // Based on cultural dimensions
  if (traits.cultural_dimensions?.power_distance && traits.cultural_dimensions.power_distance >= 0.6) {
    styles.push("Respects hierarchical communication structures");
  }

  return styles.length > 0 ? styles : ["Adaptable communication style"];
};

export const getStressResponse = (traits: TraitProfile) => {
  const responses = [];

  if (traits.big_five?.neuroticism && traits.big_five.neuroticism >= 0.6) {
    responses.push("More sensitive to stress, may need extra support during pressure");
  } else if (traits.big_five?.neuroticism && traits.big_five.neuroticism <= 0.4) {
    responses.push("Remains calm under pressure, resilient to stress");
  }

  if (traits.extended_traits?.emotional_regulation && traits.extended_traits.emotional_regulation >= 0.6) {
    responses.push("Good at managing emotional reactions");
  }

  if (traits.extended_traits?.conflict_avoidance && traits.extended_traits.conflict_avoidance >= 0.6) {
    responses.push("Avoids confrontation, prefers harmony");
  }

  if (traits.behavioral_economics?.loss_aversion && traits.behavioral_economics.loss_aversion >= 0.6) {
    responses.push("Stress increases when facing potential losses");
  }

  return responses.length > 0 ? responses : ["Moderate stress response"];
};