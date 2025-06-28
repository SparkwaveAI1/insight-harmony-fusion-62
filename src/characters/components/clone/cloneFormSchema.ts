
import { z } from "zod";

export const cloneFormSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  customization_notes: z.string().optional(),
});

export type CloneFormValues = z.infer<typeof cloneFormSchema>;
