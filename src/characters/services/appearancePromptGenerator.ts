
import { NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';
import { CreativeCharacterData } from '../types/characterTraitTypes';

export interface AppearancePromptData {
  // For non-humanoid characters
  physicalManifestation?: NonHumanoidTraitProfile['physical_manifestation'];
  speciesType?: string;
  formFactor?: string;
  
  // For humanoid characters
  physicalDescription?: string;
  
  // Common fields
  name: string;
  entityType: string;
  environment?: string;
}

export const generateAppearancePrompt = (data: AppearancePromptData): string => {
  console.log('Generating appearance prompt for:', data.name);
  
  if (data.entityType === 'non-humanoid' && data.physicalManifestation) {
    return generateNonHumanoidAppearancePrompt(data);
  } else if (data.physicalDescription) {
    return generateHumanoidAppearancePrompt(data);
  } else {
    // Fallback for characters without detailed physical data
    return generateBasicAppearancePrompt(data);
  }
};

const generateNonHumanoidAppearancePrompt = (data: AppearancePromptData): string => {
  const manifest = data.physicalManifestation!;
  const promptParts: string[] = [];
  
  // Start with the entity name and basic form
  if (manifest.primary_form) {
    promptParts.push(`${data.name}, a ${manifest.primary_form}`);
  } else {
    promptParts.push(`${data.name}, a ${data.speciesType || 'non-humanoid entity'}`);
  }
  
  // Add scale information
  if (manifest.scale_category) {
    promptParts.push(`of ${manifest.scale_category} scale`);
  }
  
  // Add material composition
  if (manifest.material_composition) {
    promptParts.push(`composed of ${manifest.material_composition}`);
  }
  
  // Add dimensional properties
  if (manifest.dimensional_properties) {
    promptParts.push(`with ${manifest.dimensional_properties} dimensional properties`);
  }
  
  // Add texture quality
  if (manifest.texture_quality) {
    promptParts.push(`featuring ${manifest.texture_quality} texture`);
  }
  
  // Add luminescence pattern
  if (manifest.luminescence_pattern) {
    promptParts.push(`emitting ${manifest.luminescence_pattern} light patterns`);
  }
  
  // Add movement characteristics
  if (manifest.movement_characteristics) {
    promptParts.push(`moving with ${manifest.movement_characteristics} motion`);
  }
  
  // Add environmental interaction
  if (manifest.environmental_interaction) {
    promptParts.push(`interacting with environment through ${manifest.environmental_interaction}`);
  }
  
  // Add sensory emanations
  if (manifest.sensory_emanations) {
    promptParts.push(`producing ${manifest.sensory_emanations} sensory effects`);
  }
  
  // Add structural complexity
  if (manifest.structural_complexity) {
    promptParts.push(`with ${manifest.structural_complexity} structural design`);
  }
  
  // Add environment context if available
  if (data.environment) {
    promptParts.push(`in a ${data.environment} setting`);
  }
  
  // Join all parts and add image generation directives
  const basePrompt = promptParts.join(', ');
  
  return `${basePrompt}, highly detailed, photorealistic, professional concept art, dramatic lighting, neutral background, 4K quality, no text, no labels, clear focus on the entity`;
};

const generateHumanoidAppearancePrompt = (data: AppearancePromptData): string => {
  let basePrompt = data.physicalDescription || `${data.name}, a humanoid character`;
  
  // Add environment context if available
  if (data.environment) {
    basePrompt += `, in a ${data.environment} setting`;
  }
  
  // Add image generation optimization
  return `${basePrompt}, highly detailed portrait, photorealistic, professional quality, dramatic lighting, neutral background, 4K resolution, no text, no labels, clear facial features and body details`;
};

const generateBasicAppearancePrompt = (data: AppearancePromptData): string => {
  const entityDesc = data.entityType === 'non-humanoid' ? 'non-humanoid entity' : 'humanoid character';
  let basePrompt = `${data.name}, a ${entityDesc}`;
  
  if (data.environment) {
    basePrompt += ` in a ${data.environment} environment`;
  }
  
  return `${basePrompt}, highly detailed, photorealistic, professional concept art, dramatic lighting, neutral background, 4K quality, no text, no labels`;
};

// Helper function to generate prompts from CreativeCharacterData during character creation
export const generateAppearancePromptFromCreativeData = (data: CreativeCharacterData): string => {
  const promptData: AppearancePromptData = {
    name: data.name,
    entityType: data.entityType,
    environment: data.environment,
    physicalDescription: data.physicalAppearanceDescription
  };
  
  return generateAppearancePrompt(promptData);
};
