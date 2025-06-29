
-- Drop the foreign key constraint that's blocking non-humanoid character images
ALTER TABLE public.character_images DROP CONSTRAINT IF EXISTS character_images_character_id_fkey;
