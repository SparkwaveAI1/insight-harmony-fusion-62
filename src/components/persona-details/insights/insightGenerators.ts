
import { getTraitValue } from './traitUtils';

export const generateDecisions = (metadata: any): string[] => {
  const decisions = [];
  const traitProfile = metadata?.trait_profile || {};
  
  const conscientiousness = getTraitValue(traitProfile, 'big_five.conscientiousness');
  const openness = getTraitValue(traitProfile, 'big_five.openness');
  const riskSensitivity = getTraitValue(traitProfile, 'behavioral_economics.risk_sensitivity');
  const neuroticism = getTraitValue(traitProfile, 'big_five.neuroticism');
  
  console.log('Decision traits:', { conscientiousness, openness, riskSensitivity, neuroticism });

  // Primary decision-making style
  if (conscientiousness > 0.7) {
    decisions.push("Follows systematic decision-making processes with thorough evaluation of options");
  } else if (openness > 0.7) {
    decisions.push("Values innovative approaches and considers unconventional alternatives");
  } else if (riskSensitivity > 0.7) {
    decisions.push("Takes a cautious approach to decision-making, carefully weighing potential downsides");
  } else if (riskSensitivity < 0.3) {
    decisions.push("Embraces calculated risks in decision-making, focusing on potential opportunities");
  } else {
    decisions.push("Combines practical experience with thoughtful analysis when making choices");
  }

  // Secondary decision factor
  if (neuroticism > 0.6) {
    decisions.push("May seek additional validation or reassurance for important decisions");
  } else if (conscientiousness > 0.6) {
    decisions.push("Adapts decision approach based on the specific context and stakes involved");
  } else {
    decisions.push("Balances intuition with analytical thinking in decision processes");
  }

  return decisions;
};

export const generateDrivers = (metadata: any): string[] => {
  const drivers = [];
  const traitProfile = metadata?.trait_profile || {};
  
  const achievement = getTraitValue(traitProfile, 'extended_traits.achievement');
  const care = getTraitValue(traitProfile, 'moral_foundations.care');
  const fairness = getTraitValue(traitProfile, 'moral_foundations.fairness');
  const extraversion = getTraitValue(traitProfile, 'big_five.extraversion');
  
  console.log('Driver traits:', { achievement, care, fairness, extraversion });

  // Primary motivation
  if (achievement > 0.7) {
    drivers.push("Driven by personal achievement and setting challenging goals");
  } else if (care > 0.7) {
    drivers.push("Strongly motivated by opportunities to care for and support others");
  } else if (fairness > 0.7) {
    drivers.push("Values equity and fairness in systems and relationships");
  } else {
    drivers.push("Motivated by a combination of professional growth and personal fulfillment");
  }

  // Secondary motivation
  if (extraversion > 0.7) {
    drivers.push("Energized by social recognition and collaborative achievements");
  } else if (metadata?.age && parseInt(metadata.age) < 30) {
    drivers.push("Motivated by building skills and establishing professional identity");
  } else if (metadata?.age && parseInt(metadata.age) > 50) {
    drivers.push("Drawn to meaningful work that aligns with personal values and legacy");
  } else {
    drivers.push("Balances material security with opportunities for meaningful experiences");
  }

  return drivers;
};

export const generatePersuasion = (metadata: any): string[] => {
  const persuasion = [];
  const traitProfile = metadata?.trait_profile || {};
  
  const openness = getTraitValue(traitProfile, 'big_five.openness');
  const agreeableness = getTraitValue(traitProfile, 'big_five.agreeableness');
  const conscientiousness = getTraitValue(traitProfile, 'big_five.conscientiousness');
  const truthOrientation = getTraitValue(traitProfile, 'extended_traits.truth_orientation');
  
  console.log('Persuasion traits:', { openness, agreeableness, conscientiousness, truthOrientation });

  // Communication preference
  if (openness < 0.4) {
    persuasion.push("Responds best to practical, straightforward communication with clear benefits");
  } else if (truthOrientation > 0.7) {
    persuasion.push("Appreciates honest, direct communication even when messages are challenging");
  } else if (openness > 0.7) {
    persuasion.push("Values well-researched arguments that acknowledge complexity and nuance");
  } else {
    persuasion.push("Responds to balanced communication that addresses both logic and values");
  }

  // Trust-building preference
  if (agreeableness > 0.7) {
    persuasion.push("Builds trust through warm, collaborative communication styles");
  } else if (conscientiousness > 0.7) {
    persuasion.push("Appreciates thorough preparation and attention to detail in presentations");
  } else {
    persuasion.push("Evaluates both emotional resonance and factual accuracy when forming opinions");
  }

  return persuasion;
};
