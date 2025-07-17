
// Helper function to extract historical period from date of birth and AI analysis
export function extractHistoricalPeriod(dateOfBirth: string, aiTraits: any): string {
  // First check if AI extracted a specific historical period
  if (aiTraits.historical_period) {
    console.log('📅 Using AI-extracted historical period:', aiTraits.historical_period);
    return aiTraits.historical_period;
  }
  
  // Try to parse the date and determine period
  if (dateOfBirth) {
    const year = parseInt(dateOfBirth.split('-')[0]) || parseInt(dateOfBirth.match(/-?\d{4}/)?.[0] || '');
    if (year) {
      console.log('📅 Determining period from year:', year);
      if (year < -8000) return 'Paleolithic';
      if (year < -4000) return 'Epipaleolithic/Mesolithic';
      if (year < -3000) return 'Neolithic';
      if (year < 0) return 'Bronze/Iron Age';
      if (year < 500) return 'Classical Antiquity';
      if (year < 1000) return 'Early Medieval';
      if (year < 1500) return 'Medieval';
      if (year < 1800) return 'Early Modern';
      return 'Modern';
    }
  }
  
  return 'Historical Period';
}

// Helper function to extract appropriate religious context based on historical period
export function extractReligiousContext(aiTraits: any, historicalPeriod: string): { affiliation: string, practice_level: string } {
  // If AI has specific religious context that's not generic, use it
  if (aiTraits.religious_affiliation && aiTraits.religious_affiliation !== 'Christian' && aiTraits.religious_affiliation !== 'traditional beliefs') {
    console.log('⛪ Using AI-specific religious affiliation:', aiTraits.religious_affiliation);
    return {
      affiliation: aiTraits.religious_affiliation,
      practice_level: aiTraits.religious_practice_level || 'moderate'
    };
  }
  
  // Determine appropriate religious context based on historical period
  console.log('⛪ Determining religious context for period:', historicalPeriod);
  
  if (['Paleolithic', 'Epipaleolithic/Mesolithic', 'Neolithic'].includes(historicalPeriod)) {
    return {
      affiliation: 'Animistic/Shamanic traditions',
      practice_level: aiTraits.religious_practice_level || 'integrated into daily life'
    };
  }
  
  if (['Bronze/Iron Age', 'Bronze Age', 'Classical Antiquity'].includes(historicalPeriod)) {
    return {
      affiliation: 'Polytheistic/Traditional beliefs',
      practice_level: aiTraits.religious_practice_level || 'moderate'
    };
  }
  
  if (['Early Medieval', 'Medieval'].includes(historicalPeriod)) {
    return {
      affiliation: 'Medieval Christianity',
      practice_level: aiTraits.religious_practice_level || 'high'
    };
  }
  
  // For other periods, check if AI provided appropriate context
  if (aiTraits.religious_affiliation && aiTraits.religious_affiliation !== 'Christian') {
    return {
      affiliation: aiTraits.religious_affiliation,
      practice_level: aiTraits.religious_practice_level || 'moderate'
    };
  }
  
  // Default to regional appropriate religion
  return {
    affiliation: 'Regional traditional beliefs',
    practice_level: aiTraits.religious_practice_level || 'moderate'
  };
}
