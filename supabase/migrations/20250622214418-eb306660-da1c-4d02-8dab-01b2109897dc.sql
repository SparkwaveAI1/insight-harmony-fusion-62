
-- Create characters table (isolated from personas)
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  character_type TEXT NOT NULL,
  creation_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}',
  trait_profile JSONB NOT NULL DEFAULT '{}',
  behavioral_modulation JSONB NOT NULL DEFAULT '{}',
  linguistic_profile JSONB NOT NULL DEFAULT '{}',
  emotional_triggers JSONB DEFAULT '{"negative_triggers": [], "positive_triggers": []}',
  preinterview_tags JSONB NOT NULL DEFAULT '[]',
  simulation_directives JSONB NOT NULL DEFAULT '{}',
  interview_sections JSONB NOT NULL DEFAULT '[]',
  prompt TEXT,
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  enhanced_metadata_version INTEGER DEFAULT 2
);

-- Create character_images table (isolated from persona_images)
CREATE TABLE public.character_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  original_url TEXT,
  is_current BOOLEAN DEFAULT true,
  generation_prompt TEXT,
  physical_attributes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (character_id) REFERENCES public.characters(character_id) ON DELETE CASCADE
);

-- Enable Row Level Security on characters table
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for characters
CREATE POLICY "Users can view their own characters" 
  ON public.characters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters" 
  ON public.characters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" 
  ON public.characters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" 
  ON public.characters 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Public characters are viewable by all" 
  ON public.characters 
  FOR SELECT 
  USING (is_public = true);

-- Enable Row Level Security on character_images table
ALTER TABLE public.character_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for character_images
CREATE POLICY "Users can view images of their own characters" 
  ON public.character_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.characters 
      WHERE characters.character_id = character_images.character_id 
      AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images for their own characters" 
  ON public.character_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters 
      WHERE characters.character_id = character_images.character_id 
      AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images of their own characters" 
  ON public.character_images 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.characters 
      WHERE characters.character_id = character_images.character_id 
      AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images of their own characters" 
  ON public.character_images 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.characters 
      WHERE characters.character_id = character_images.character_id 
      AND characters.user_id = auth.uid()
    )
  );

-- Create trigger function to manage current character images
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

-- Create trigger for character images
CREATE TRIGGER on_character_image_current_update
  BEFORE INSERT OR UPDATE ON public.character_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_character_current_image();

-- Add indexes for performance
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_characters_character_id ON public.characters(character_id);
CREATE INDEX idx_characters_is_public ON public.characters(is_public);
CREATE INDEX idx_character_images_character_id ON public.character_images(character_id);
CREATE INDEX idx_character_images_is_current ON public.character_images(is_current);
