
export function buildImagePrompt(personaData: any): string {
  console.log("Generating simple persona visual prompt");
  
  const metadata = personaData.metadata || {};
  
  // Basic demographic information
  const age = metadata.age || '30';
  const gender = metadata.gender || 'person';
  
  // Simple physical characteristics
  const hairColor = metadata.hair_color || 'brown';
  const eyeColor = metadata.eye_color || 'brown';
  const skinTone = metadata.skin_tone || 'medium';
  const bodyType = metadata.build_body_type || 'average build';
  
  // Build simple visual prompt
  let prompt = `Portrait of a ${age}-year-old ${gender}, ${hairColor} hair, ${eyeColor} eyes, ${skinTone} skin, ${bodyType}`;
  
  // Simple style requirements
  prompt += ', professional portrait, clean background, photorealistic, no text, no words, no labels';
  
  console.log("Simple persona prompt:", prompt);
  return prompt;
}
