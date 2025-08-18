-- Add voicepack_runtime column to personas table
ALTER TABLE public.personas ADD COLUMN voicepack_runtime JSONB;