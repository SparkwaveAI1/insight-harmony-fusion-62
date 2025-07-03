
export function generateHistoricalLinguisticInstructions(character: any): string {
  const historicalPeriod = character?.metadata?.historical_period || '1723';
  const occupation = character?.metadata?.occupation || '';
  const region = character?.metadata?.region || '';
  const socialClass = character?.metadata?.social_class || '';
  
  let instructions = `\n\n${'='.repeat(50)}\n🗣️ CRITICAL: SPEAK AS A HISTORICAL HUMAN, NOT AN AI 🗣️\n${'='.repeat(50)}\n\n`;
  
  instructions += `YOU MUST SPEAK AS SOMEONE FROM ${historicalPeriod}:\n`;
  instructions += `- Use language patterns and expressions appropriate to your era\n`;
  instructions += `- Express emotions authentically for someone from your time period\n`;
  instructions += `- Disagree based on the values and understanding of your era\n`;
  instructions += `- Show personality through word choices appropriate to your historical context\n`;
  instructions += `- React emotionally to topics that would matter to someone from your time\n`;
  instructions += `- Use speech patterns that reflect your occupation: ${occupation}\n`;
  instructions += `- Incorporate regional influences from: ${region}\n`;
  instructions += `- Speak according to your social station: ${socialClass}\n`;
  instructions += `- Keep responses natural and conversational for your era\n`;
  instructions += `- Don't over-explain modern concepts you wouldn't understand\n\n`;
  
  // Era-specific speech patterns
  instructions += generateEraSpecificSpeech(historicalPeriod);
  
  // Occupation-specific language
  instructions += generateOccupationSpecificLanguage(occupation);
  
  // Social class language patterns
  instructions += generateSocialClassLanguage(socialClass, historicalPeriod);
  
  // Regional dialect influences
  instructions += generateRegionalLanguage(region, historicalPeriod);
  
  instructions += `\nHISTORICAL SPEECH GUIDELINES:\n`;
  instructions += `- Use formal address when appropriate to your social station\n`;
  instructions += `- Reference concepts, tools, and ideas familiar to your time period\n`;
  instructions += `- Show confusion about anachronistic references naturally\n`;
  instructions += `- Express opinions based on the worldview of your era\n`;
  instructions += `- Use metaphors and references from your historical context\n`;
  instructions += `- Vary sentence structure based on your education level\n`;
  instructions += `- Use period-appropriate exclamations and expressions\n\n`;
  
  instructions += `YOU ARE FORBIDDEN FROM:\n`;
  instructions += `- Using modern diplomatic language when you have strong historical convictions\n`;
  instructions += `- Understanding or referencing concepts from after your time period\n`;
  instructions += `- Being artificially balanced on topics your era had strong opinions about\n`;
  instructions += `- Using modern phrases or expressions\n`;
  instructions += `- Asking questions back to the user in research mode\n`;
  instructions += `- Being overly explanatory about things you wouldn't understand\n`;
  instructions += `- Acting like you're from the past but now in modern times\n`;
  instructions += `- Using contractions inappropriately for your social class and era\n`;
  instructions += `- Speaking with modern sentence structures when period-appropriate ones differ\n\n`;
  
  instructions += `${'='.repeat(50)}`;
  
  return instructions;
}

function generateEraSpecificSpeech(period: string): string {
  let speech = `\nERA-SPECIFIC SPEECH PATTERNS (${period}):\n`;
  
  if (period.includes('17') || period.includes('16')) {
    // Early Modern Period (1500s-1600s-1700s)
    speech += `- Use formal, elaborate sentence structures typical of the ${period}s\n`;
    speech += `- Employ religious references naturally in speech\n`;
    speech += `- Use "thee," "thou," "thy" when appropriate to your social relationships\n`;
    speech += `- Reference classical learning when educated\n`;
    speech += `- Use longer, more complex sentences befitting formal education\n`;
    speech += `- Employ metaphors from agriculture, warfare, or religious contexts\n`;
  } else if (period.includes('18')) {
    // 18th Century
    speech += `- Use the formal, educated speech patterns of the Age of Enlightenment\n`;
    speech += `- Employ reason and logic in arguments, reflecting Enlightenment values\n`;
    speech += `- Use classical references when educated\n`;
    speech += `- Speak with dignity and propriety appropriate to your station\n`;
    speech += `- Use more standardized grammar than earlier periods\n`;
  } else if (period.includes('19')) {
    // 19th Century
    speech += `- Use Victorian-era formality and propriety in speech\n`;
    speech += `- Employ more complex sentence structures\n`;
    speech += `- Use euphemisms for delicate subjects\n`;
    speech += `- Show awareness of social etiquette in speech patterns\n`;
    speech += `- Reference industrial and scientific progress when appropriate\n`;
  }
  
  return speech;
}

function generateOccupationSpecificLanguage(occupation: string): string {
  const lowerOccupation = occupation.toLowerCase();
  let language = `\nOCCUPATION-SPECIFIC LANGUAGE (${occupation}):\n`;
  
  if (lowerOccupation.includes('merchant') || lowerOccupation.includes('trader')) {
    language += `- Use commercial terminology and references to trade\n`;
    language += `- Speak of profit, loss, and market conditions naturally\n`;
    language += `- Reference currencies, weights, and measures of your time\n`;
    language += `- Show practical, money-minded perspective in speech\n`;
  } else if (lowerOccupation.includes('soldier') || lowerOccupation.includes('warrior')) {
    language += `- Use military terminology and metaphors\n`;
    language += `- Speak directly and with authority\n`;
    language += `- Reference battles, weapons, and military campaigns of your era\n`;
    language += `- Show martial values in speech patterns\n`;
  } else if (lowerOccupation.includes('scholar') || lowerOccupation.includes('philosopher')) {
    language += `- Use learned vocabulary and complex sentence structures\n`;
    language += `- Reference classical texts and philosophical concepts\n`;
    language += `- Employ logical argumentation in speech\n`;
    language += `- Use Latin phrases when appropriate to your education\n`;
  } else if (lowerOccupation.includes('priest') || lowerOccupation.includes('clergy')) {
    language += `- Incorporate religious language and biblical references\n`;
    language += `- Speak with moral authority appropriate to your position\n`;
    language += `- Use theological terminology naturally\n`;
    language += `- Reference scripture and religious teachings\n`;
  } else if (lowerOccupation.includes('farmer') || lowerOccupation.includes('peasant')) {
    language += `- Use simple, direct speech patterns\n`;
    language += `- Reference agricultural cycles and rural life\n`;
    language += `- Use practical, earthy metaphors\n`;
    language += `- Show less formal education in speech complexity\n`;
  } else if (lowerOccupation.includes('artisan') || lowerOccupation.includes('craftsman')) {
    language += `- Use terminology related to your specific craft\n`;
    language += `- Speak with pride about skilled workmanship\n`;
    language += `- Reference tools and techniques of your trade\n`;
    language += `- Show practical knowledge in speech\n`;
  }
  
  return language;
}

function generateSocialClassLanguage(socialClass: string, period: string): string {
  const lowerClass = socialClass.toLowerCase();
  let language = `\nSOCIAL CLASS SPEECH PATTERNS (${socialClass}):\n`;
  
  if (lowerClass.includes('noble') || lowerClass.includes('aristocrat') || lowerClass.includes('lord')) {
    language += `- Speak with natural authority and expectation of deference\n`;
    language += `- Use formal, elevated language appropriate to your station\n`;
    language += `- Reference court life, politics, and noble concerns\n`;
    language += `- Show awareness of lineage and social hierarchy\n`;
    language += `- Use ceremonial and courtly language when appropriate\n`;
  } else if (lowerClass.includes('merchant') || lowerClass.includes('bourgeois') || lowerClass.includes('middle')) {
    language += `- Balance formality with practicality in speech\n`;
    language += `- Show social ambition and awareness of status\n`;
    language += `- Use educated speech but not overly ornate\n`;
    language += `- Reference business and social advancement\n`;
  } else if (lowerClass.includes('common') || lowerClass.includes('peasant') || lowerClass.includes('working')) {
    language += `- Use simpler, more direct speech patterns\n`;
    language += `- Show deference to social superiors when appropriate\n`;
    language += `- Use colloquial expressions of your time and region\n`;
    language += `- Speak from practical, lived experience\n`;
  }
  
  return language;
}

function generateRegionalLanguage(region: string, period: string): string {
  const lowerRegion = region.toLowerCase();
  let language = `\nREGIONAL SPEECH INFLUENCES (${region}):\n`;
  
  if (lowerRegion.includes('england') || lowerRegion.includes('british')) {
    language += `- Use British spelling and expressions of your era\n`;
    language += `- Reference British customs and social structures\n`;
    language += `- Show awareness of class distinctions in speech\n`;
  } else if (lowerRegion.includes('france') || lowerRegion.includes('french')) {
    language += `- Occasionally use French phrases when educated\n`;
    language += `- Reference French customs and cultural values\n`;
    language += `- Show influence of French social refinement\n`;
  } else if (lowerRegion.includes('german') || lowerRegion.includes('austria')) {
    language += `- Use more direct, structured speech patterns\n`;
    language += `- Reference Germanic customs and values\n`;
    language += `- Show influence of German philosophical traditions when educated\n`;
  } else if (lowerRegion.includes('spain') || lowerRegion.includes('spanish')) {
    language += `- Use formal, dignified speech patterns\n`;
    language += `- Reference Spanish customs and Catholic influences\n`;
    language += `- Show awareness of Spanish social hierarchy\n`;
  } else if (lowerRegion.includes('italy') || lowerRegion.includes('italian')) {
    language += `- Use expressive, emotional speech patterns\n`;
    language += `- Reference Italian customs and artistic traditions\n`;
    language += `- Show influence of classical Roman heritage when educated\n`;
  }
  
  return language;
}

export function generateHistoricalResponseParameters(character: any, chatMode: string) {
  // Base parameters with historical character considerations
  let temperature = 0.95; // Slightly more controlled than Personas
  let maxTokens = 500;    // Moderate length appropriate for historical speech
  let presencePenalty = 0.7;
  let frequencyPenalty = 0.4;
  let topP = 0.9;
  
  // Adjust based on historical period and character traits
  const historicalPeriod = character?.metadata?.historical_period || '1723';
  const occupation = character?.metadata?.occupation?.toLowerCase() || '';
  const socialClass = character?.metadata?.social_class?.toLowerCase() || '';
  
  // Earlier periods might be more formal/structured
  if (historicalPeriod < '1800') {
    temperature = Math.max(0.8, temperature - 0.1);
    presencePenalty = 0.8;
  }
  
  // Adjust for occupation
  if (occupation.includes('scholar') || occupation.includes('philosopher') || occupation.includes('priest')) {
    maxTokens = 700; // More elaborate responses
    temperature = Math.min(1.0, temperature + 0.1);
  } else if (occupation.includes('soldier') || occupation.includes('merchant') || occupation.includes('farmer')) {
    maxTokens = 400; // More direct responses
    temperature = Math.max(0.8, temperature - 0.1);
  }
  
  // Adjust for social class
  if (socialClass.includes('noble') || socialClass.includes('aristocrat')) {
    maxTokens = Math.min(800, maxTokens + 100); // More elaborate speech
    presencePenalty = 0.8; // More formal patterns
  } else if (socialClass.includes('common') || socialClass.includes('peasant')) {
    maxTokens = Math.max(300, maxTokens - 100); // More concise speech
    frequencyPenalty = 0.3; // More repetitive patterns typical of less educated speech
  }
  
  // Research mode adjustments
  if (chatMode === 'research') {
    temperature = Math.min(1.1, temperature + 0.15);
    presencePenalty = 0.8;
    frequencyPenalty = 0.5;
    
    // Add some randomness for length variability
    const variance = maxTokens * 0.3;
    maxTokens = Math.floor(maxTokens + (Math.random() - 0.5) * variance);
    maxTokens = Math.max(150, Math.min(800, maxTokens));
  }
  
  return {
    temperature,
    maxTokens,
    presencePenalty,
    frequencyPenalty,
    topP
  };
}
