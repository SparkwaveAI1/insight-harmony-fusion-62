
-- Add description column to personas table
ALTER TABLE public.personas 
ADD COLUMN IF NOT EXISTS description TEXT;
