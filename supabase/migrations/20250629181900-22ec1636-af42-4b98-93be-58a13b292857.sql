
-- Create character_images table to track all generated images for characters
CREATE TABLE IF NOT EXISTS public.character_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL,
  original_url TEXT,
  storage_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  generation_prompt TEXT,
  physical_attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_current BOOLEAN DEFAULT true
);

-- Add RLS policies for character images
ALTER TABLE public.character_images ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view images for characters they own
CREATE POLICY "Users can view images for their characters" ON public.character_images
FOR SELECT USING (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to insert images for their characters
CREATE POLICY "Users can insert images for their characters" ON public.character_images
FOR INSERT WITH CHECK (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to update images for their characters
CREATE POLICY "Users can update images for their characters" ON public.character_images
FOR UPDATE USING (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to delete images for their characters
CREATE POLICY "Users can delete images for their characters" ON public.character_images
FOR DELETE USING (
  character_id IN (
    SELECT character_id FROM public.characters WHERE user_id = auth.uid()
    UNION
    SELECT character_id FROM public.non_humanoid_characters WHERE user_id = auth.uid()
  )
);

-- Create trigger to ensure only one current image per character
CREATE OR REPLACE FUNCTION public.update_character_current_image()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If this is being set as current, unset any other current images for this character
  IF NEW.is_current = true THEN
    UPDATE public.character_images
    SET is_current = false
    WHERE character_id = NEW.character_id
    AND id != NEW.id
    AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER character_images_current_trigger
  BEFORE INSERT OR UPDATE ON public.character_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_character_current_image();
