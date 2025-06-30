
-- Add appearance_prompt field to both character tables
ALTER TABLE public.characters 
ADD COLUMN appearance_prompt TEXT;

ALTER TABLE public.non_humanoid_characters 
ADD COLUMN appearance_prompt TEXT;
