
import { z } from 'zod';

export const creativeCharacterSchema = z.object({
  // Core required fields (same as historical)
  name: z.string().min(1, 'Character name is required'),
  description: z.string().min(10, 'Please provide a detailed description (at least 10 characters)'),
  
  // Creative-specific required fields
  genre: z.string().min(1, 'Genre is required'),
  species: z.string().min(1, 'Species is required'),
  universe: z.string().min(1, 'Universe/World is required'),
  
  // Creative-specific optional fields - AI will generate/enhance these
  magical_abilities: z.string().optional(),
  technological_augmentations: z.string().optional(),
  world_origin: z.string().optional(),
  power_level: z.string().optional(),
  faction_allegiance: z.string().optional(),
  backstory: z.string().optional(),
  personality_traits: z.string().optional(),
  appearance: z.string().optional(),
  special_abilities: z.string().optional(),
  equipment_items: z.string().optional(),
});

export type CreativeCharacterFormData = z.infer<typeof creativeCharacterSchema>;
