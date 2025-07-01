
-- First, let's check the current RLS policies for characters table
-- and ensure they properly restrict access to only the owner's characters

-- Update the characters table RLS policies to be more explicit
DROP POLICY IF EXISTS "Users can view their own characters" ON public.characters;
DROP POLICY IF EXISTS "Public characters are viewable by all" ON public.characters;

-- Create more explicit policies
CREATE POLICY "Users can view only their own characters" 
ON public.characters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public characters are viewable by everyone" 
ON public.characters 
FOR SELECT 
USING (is_public = true);

-- Ensure image generation is properly restricted
-- Update character_images policies to be more restrictive
DROP POLICY IF EXISTS "Users can insert images for their characters" ON public.character_images;

CREATE POLICY "Users can insert images only for their own characters" 
ON public.character_images 
FOR INSERT 
WITH CHECK (
  character_id IN (
    SELECT character_id 
    FROM characters 
    WHERE user_id = auth.uid()
  )
);

-- Also ensure the creative character image service checks ownership
-- by updating the RLS policy to be more explicit
DROP POLICY IF EXISTS "Users can view images for their characters" ON public.character_images;

CREATE POLICY "Users can view images for their own characters or public character images" 
ON public.character_images 
FOR SELECT 
USING (
  character_id IN (
    SELECT character_id 
    FROM characters 
    WHERE user_id = auth.uid() OR is_public = true
  )
);
