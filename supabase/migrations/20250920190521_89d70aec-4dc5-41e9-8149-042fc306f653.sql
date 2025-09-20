-- Add background field to v4_personas table for storing life story
ALTER TABLE public.v4_personas 
ADD COLUMN background TEXT NULL;