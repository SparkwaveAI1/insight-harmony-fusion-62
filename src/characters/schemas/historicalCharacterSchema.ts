
import { z } from 'zod';

export const historicalCharacterSchema = z.object({
  // Basic Information (mandatory)
  name: z.string().min(1, 'Character name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  age: z.string().min(1, 'Age is required'),
  location: z.string().min(1, 'Location is required'),
  
  // Optional fields following persona pattern
  description: z.string().optional(),
  backstory: z.string().optional(),
  personality_traits: z.string().optional(),
  appearance: z.string().optional(),
  
  // Historical specific fields
  occupation: z.string().optional(),
  historical_context: z.string().optional(),
});

export type HistoricalCharacterFormData = z.infer<typeof historicalCharacterSchema>;
