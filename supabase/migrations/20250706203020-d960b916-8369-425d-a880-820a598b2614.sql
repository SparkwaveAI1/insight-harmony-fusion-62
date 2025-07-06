
-- Add description column to personas table
ALTER TABLE public.personas 
ADD COLUMN description TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.personas.description IS 'AI-generated paragraph description of the persona (under 300 words)';
