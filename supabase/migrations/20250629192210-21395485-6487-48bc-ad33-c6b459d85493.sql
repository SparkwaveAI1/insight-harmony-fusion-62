
-- Drop the older, restrictive policies that only check the characters table
DROP POLICY IF EXISTS "Users can insert images for their own characters" ON public.character_images;
DROP POLICY IF EXISTS "Users can view images of their own characters" ON public.character_images;
DROP POLICY IF EXISTS "Users can update images of their own characters" ON public.character_images;
DROP POLICY IF EXISTS "Users can delete images of their own characters" ON public.character_images;

-- Ensure the comprehensive policies exist (these should already be there based on the migration)
-- But let's recreate them to be sure they're correct
DROP POLICY IF EXISTS "Users can view images for their characters" ON public.character_images;
DROP POLICY IF EXISTS "Users can insert images for their characters" ON public.character_images;
DROP POLICY IF EXISTS "Users can update images for their characters" ON public.character_images;
DROP POLICY IF EXISTS "Users can delete images for their characters" ON public.character_images;

-- Create the correct comprehensive policies
CREATE POLICY "Users can view images for their characters" ON public.character_images
FOR SELECT USING (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert images for their characters" ON public.character_images
FOR INSERT WITH CHECK (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update images for their characters" ON public.character_images
FOR UPDATE USING (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images for their characters" ON public.character_images
FOR DELETE USING (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);
