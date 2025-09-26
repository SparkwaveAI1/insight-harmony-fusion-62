// @ts-nocheck
// Input Processing Utilities for Persona Generation

export interface ExtractedUserDetails {
  name?: string;
  age?: number;
  occupation?: string;
  location?: string;
  education?: string;
  familyStatus?: string;
  interests?: string[];
  personalityTraits?: string[];
  challenges?: string[];
  background?: string[];
  physicalDescription?: string[];
  hasFamily: boolean;
  hasStressors: boolean;
  hasHealthIssues: boolean;
  hasFinancialInterests: boolean;
  fullPrompt: string;
}

export function extractUserDetails(prompt: string): ExtractedUserDetails {
  console.log('🔍 Extracting structured data from user prompt...');
  
  // Name extraction - look for capitalized first and last names
  const nameMatch = prompt.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  
  // Age extraction - look for numbers that could be ages
  const ageMatch = prompt.match(/(\b(?:1[8-9]|[2-6][0-9]|7[0-5])\b)/);
  
  // Occupation extraction - multiple patterns
  const occupationPatterns = [
    /(?:works as|job as|career as|profession as|employed as)\s+(?:a|an)?\s*([^,\.]+)/i,
    /(?:is a|is an)\s+([^,\.]+?)(?:\s+(?:for|at|in)|,|\.)/i,
    /(?:manager|developer|engineer|designer|teacher|nurse|doctor|lawyer|consultant|analyst|specialist|director|coordinator|supervisor|assistant|clerk|technician|specialist)\b/i
  ];
  
  let occupation = null;
  for (const pattern of occupationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      occupation = match[1] ? match[1].trim() : match[0];
      break;
    }
  }
  
  // Location extraction
  const locationPatterns = [
    /(?:in|from|lives in|located in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /(?:Philadelphia|NYC|New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Washington|Boston|Nashville|Baltimore|Louisville|Portland|Las Vegas|Detroit|Memphis|Oklahoma City)/gi
  ];
  
  let location = null;
  for (const pattern of locationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      location = match[match.length - 1];
      break;
    }
  }
  
  // Education extraction
  const educationMatch = prompt.match(/(?:went to|graduated from|studied at|attended|degree from)\s+([^,\.]+)/i);
  
  // Family status extraction
  const familyPatterns = [
    /married/i,
    /wife|husband|spouse|partner/i,
    /kids|children|son|daughter/i,
    /family/i
  ];
  const familyStatus = familyPatterns.find(pattern => pattern.test(prompt));
  
  // Interest extraction
  const interests = [];
  const interestPatterns = [
    /crypto|cryptocurrency|bitcoin|blockchain/i,
    /tech|technology|software|programming|coding/i,
    /fitness|gym|exercise|sports/i,
    /reading|books|literature/i,
    /music|playing|instrument/i,
    /travel|traveling|exploring/i,
    /cooking|food|cuisine/i,
    /art|creative|design/i,
    /gaming|games|video games/i
  ];
  
  interestPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) interests.push(match[0]);
  });
  
  // Personality trait extraction
  const personalityTraits = [];
  const traitPatterns = [
    /thoughtful|analytical|logical/i,
    /evasive|avoidant|procrastinating/i,
    /caring|empathetic|helpful/i,
    /organized|responsible|conscientious/i,
    /outgoing|social|extroverted/i,
    /anxious|stressed|worried/i,
    /creative|innovative|artistic/i,
    /practical|pragmatic|realistic/i
  ];
  
  traitPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) personalityTraits.push(match[0]);
  });
  
  // Challenge extraction
  const challenges = [];
  const challengePatterns = [
    /stress|stressed|pressure|overwhelmed/i,
    /health|illness|condition|medical/i,
    /financial|money|budget|debt/i,
    /work|job|career|professional/i,
    /relationship|marriage|family/i,
    /time|schedule|busy/i
  ];
  
  challengePatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) challenges.push(match[0]);
  });
  
  // Background details extraction
  const background = [];
  const backgroundPatterns = [
    /grew up|childhood|family background/i,
    /education|school|university|college/i,
    /cultural|heritage|ethnicity/i,
    /religion|religious|faith/i,
    /socioeconomic|class|income/i
  ];
  
  backgroundPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) background.push(match[0]);
  });
  
  // Physical description extraction
  const physicalDescription = [];
  const physicalPatterns = [
    /overweight|weight|heavy|slim|fit|athletic/i,
    /tall|short|height/i,
    /hair|eyes|appearance/i,
    /physical|health|fitness/i
  ];
  
  physicalPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) physicalDescription.push(match[0]);
  });
  
  const extracted: ExtractedUserDetails = {
    name: nameMatch ? nameMatch[1] : undefined,
    age: ageMatch ? parseInt(ageMatch[1]) : undefined,
    occupation: occupation,
    location: location,
    education: educationMatch ? educationMatch[1].trim() : undefined,
    familyStatus: familyStatus ? familyStatus.source : undefined,
    interests: interests,
    personalityTraits: personalityTraits,
    challenges: challenges,
    background: background,
    physicalDescription: physicalDescription,
    hasFamily: familyPatterns.some(pattern => pattern.test(prompt)),
    hasStressors: /stress|pressure|anxiety|overwhelmed|worried/i.test(prompt),
    hasHealthIssues: /health|medical|illness|condition|overweight|fitness/i.test(prompt),
    hasFinancialInterests: /crypto|money|investment|financial|budget/i.test(prompt),
    fullPrompt: prompt
  };
  
  console.log('✅ Extracted user details:', JSON.stringify(extracted, null, 2));
  return extracted;
}

export function validateUserInputPreservation(generated: any, userDetails: ExtractedUserDetails): string[] {
  const warnings: string[] = [];
  
  // Validate name preservation
  if (userDetails.name && generated.name) {
    const firstName = userDetails.name.split(' ')[0];
    if (!generated.name.includes(firstName)) {
      warnings.push(`Name mismatch: expected "${userDetails.name}", got "${generated.name}"`);
    }
  }
  
  // Validate age preservation
  if (userDetails.age && generated.identity?.age) {
    if (Math.abs(generated.identity.age - userDetails.age) > 2) {
      warnings.push(`Age mismatch: expected ~${userDetails.age}, got ${generated.identity.age}`);
    }
  }
  
  // Validate occupation preservation
  if (userDetails.occupation && generated.identity?.occupation) {
    const userOccWords = userDetails.occupation.toLowerCase().split(' ');
    const genOccWords = generated.identity.occupation.toLowerCase().split(' ');
    const hasMatch = userOccWords.some(word => genOccWords.some(genWord => genWord.includes(word) || word.includes(genWord)));
    
    if (!hasMatch) {
      warnings.push(`Occupation mismatch: expected "${userDetails.occupation}", got "${generated.identity.occupation}"`);
    }
  }
  
  // Validate location preservation
  if (userDetails.location && generated.identity?.location?.city) {
    if (!generated.identity.location.city.toLowerCase().includes(userDetails.location.toLowerCase()) &&
        !userDetails.location.toLowerCase().includes(generated.identity.location.city.toLowerCase())) {
      warnings.push(`Location mismatch: expected "${userDetails.location}", got "${generated.identity.location.city}"`);
    }
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ User input preservation warnings:', warnings);
  } else {
    console.log('✅ User input successfully preserved in generated persona');
  }
  
  return warnings;
}

export function generatePersonaRequirements(userDetails: ExtractedUserDetails): string {
  const requirements = [];
  
  if (userDetails.name) {
    requirements.push(`NAME: Must be "${userDetails.name}"`);
  }
  
  if (userDetails.age) {
    requirements.push(`AGE: Must be ${userDetails.age} or very close`);
  }
  
  if (userDetails.occupation) {
    requirements.push(`OCCUPATION: Must be "${userDetails.occupation}" or closely related`);
  }
  
  if (userDetails.location) {
    requirements.push(`LOCATION: Must be in/near "${userDetails.location}"`);
  }
  
  if (userDetails.hasFamily) {
    requirements.push(`FAMILY: Must reflect family relationships mentioned`);
  }
  
  if (userDetails.interests.length > 0) {
    requirements.push(`INTERESTS: Must include: ${userDetails.interests.join(', ')}`);
  }
  
  if (userDetails.challenges.length > 0) {
    requirements.push(`CHALLENGES: Must reflect: ${userDetails.challenges.join(', ')}`);
  }
  
  return requirements.length > 0 ? 
    `MANDATORY REQUIREMENTS FROM USER INPUT:\n${requirements.map(r => `- ${r}`).join('\n')}\n\n` : 
    '';
}