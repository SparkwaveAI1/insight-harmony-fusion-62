
import * as z from "zod";

// Define the form schema for persona cloning
export const cloneFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  customization_notes: z.string().optional(),
});

export type CloneFormValues = z.infer<typeof cloneFormSchema>;
