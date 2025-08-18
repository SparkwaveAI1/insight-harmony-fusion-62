-- Add voicepack_runtime column to personas table
ALTER TABLE public.personas 
ADD COLUMN voicepack_runtime JSONB DEFAULT NULL;

-- Add index for efficient voicepack queries
CREATE INDEX idx_personas_voicepack_runtime ON public.personas USING GIN(voicepack_runtime);

-- Add persona_version field to track schema versions
ALTER TABLE public.personas 
ADD COLUMN persona_version TEXT DEFAULT '1.0';