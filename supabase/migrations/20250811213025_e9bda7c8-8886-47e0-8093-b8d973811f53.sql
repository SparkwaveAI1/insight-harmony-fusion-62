-- Drop character_images table first (due to dependencies)
DROP TABLE IF EXISTS public.character_images CASCADE;

-- Drop the characters table with Creative Trait Architecture
DROP TABLE IF EXISTS public.characters CASCADE;

-- Drop any triggers related to character images
DROP TRIGGER IF EXISTS update_character_current_image ON public.character_images;