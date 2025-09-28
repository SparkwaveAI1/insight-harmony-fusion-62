// Survey billing utilities for Insights Engine
// Pricing: $0.02 per question per persona

export function calculateStudyCost(questions: number, personas: number): number {
  return questions * personas * 0.02;
}

export function convertDollarToCredits(dollarAmount: number): number {
  // 1 credit = $0.01, so multiply by 100
  return Math.ceil(dollarAmount * 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export interface StudyCostBreakdown {
  totalCost: number;
  requiredCredits: number;
  questionCount: number;
  personaCount: number;
  costPerQuestion: number;
}

export function getStudyCostBreakdown(questions: number, personas: number): StudyCostBreakdown {
  const totalCost = calculateStudyCost(questions, personas);
  const requiredCredits = convertDollarToCredits(totalCost);
  
  return {
    totalCost,
    requiredCredits,
    questionCount: questions,
    personaCount: personas,
    costPerQuestion: 0.02
  };
}