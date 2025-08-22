-- Add profile_image_url column to v4_personas table
ALTER TABLE public.v4_personas 
ADD COLUMN profile_image_url TEXT;