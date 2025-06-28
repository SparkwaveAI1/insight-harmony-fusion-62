
import { z } from 'zod';

export const historicalCharacterSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  age: z.string().min(1, 'Age is required'),
  location: z.string().min(1, 'Location is required'),
  
  // Demographics
  gender: z.string().min(1, 'Gender is required'),
  ethnicity: z.string().optional(),
  social_class: z.string().optional(),
  region: z.string().optional(),
  
  // Physical Appearance
  height_build: z.string().optional(),
  hair: z.string().optional(),
  eye_color: z.string().optional(),
  skin_tone: z.string().optional(),
  
  // Character Details
  description: z.string().optional(),
  backstory: z.string().optional(),
  personality_traits: z.string().optional(),
  appearance: z.string().optional(),
  occupation: z.string().optional(),
  historical_context: z.string().optional(),
});

export type HistoricalCharacterFormData = z.infer<typeof historicalCharacterSchema>;
