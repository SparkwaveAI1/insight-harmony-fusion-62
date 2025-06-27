
import { z } from "zod";

export const characterCloneFormSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  customization_notes: z.string().min(10, "Please provide detailed customization instructions (at least 10 characters)"),
});

export type CharacterCloneFormValues = z.infer<typeof characterCloneFormSchema>;
