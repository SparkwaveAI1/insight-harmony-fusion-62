
-- Create dedicated table for non-humanoid characters
CREATE TABLE public.non_humanoid_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  character_type TEXT NOT NULL DEFAULT 'multi_species',
  creation_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users,
  metadata JSONB NOT NULL DEFAULT '{}',
  behavioral_modulation JSONB NOT NULL DEFAULT '{}',
  interview_sections JSONB NOT NULL DEFAULT '[]',
  linguistic_profile JSONB NOT NULL DEFAULT '{}',
  preinterview_tags JSONB NOT NULL DEFAULT '[]',
  simulation_directives JSONB NOT NULL DEFAULT '{}',
  trait_profile JSONB NOT NULL,
  emotional_triggers JSONB DEFAULT '{"negative_triggers": [], "positive_triggers": []}',
  prompt TEXT,
  is_public BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  enhanced_metadata_version INTEGER DEFAULT 2,
  -- Non-humanoid specific fields
  origin_universe TEXT,
  species_type TEXT NOT NULL,
  form_factor TEXT
);

-- Enable RLS
ALTER TABLE public.non_humanoid_characters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for non-humanoid characters
CREATE POLICY "Users can view their own non-humanoid characters" 
  ON public.non_humanoid_characters 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own non-humanoid characters" 
  ON public.non_humanoid_characters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own non-humanoid characters" 
  ON public.non_humanoid_characters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-humanoid characters" 
  ON public.non_humanoid_characters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_non_humanoid_characters_user_id ON public.non_humanoid_characters(user_id);
CREATE INDEX idx_non_humanoid_characters_species_type ON public.non_humanoid_characters(species_type);
CREATE INDEX idx_non_humanoid_characters_character_id ON public.non_humanoid_characters(character_id);

-- Create table for non-humanoid character images
CREATE TABLE public.non_humanoid_character_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES public.non_humanoid_characters(character_id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  original_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_current BOOLEAN DEFAULT true,
  physical_attributes JSONB DEFAULT '{}',
  generation_prompt TEXT
);

-- Enable RLS for non-humanoid character images
ALTER TABLE public.non_humanoid_character_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for non-humanoid character images
CREATE POLICY "Users can view images of their non-humanoid characters" 
  ON public.non_humanoid_character_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.non_humanoid_characters 
      WHERE non_humanoid_characters.character_id = non_humanoid_character_images.character_id 
      AND (non_humanoid_characters.user_id = auth.uid() OR non_humanoid_characters.is_public = true)
    )
  );

CREATE POLICY "Users can manage images of their non-humanoid characters" 
  ON public.non_humanoid_character_images 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.non_humanoid_characters 
      WHERE non_humanoid_characters.character_id = non_humanoid_character_images.character_id 
      AND non_humanoid_characters.user_id = auth.uid()
    )
  );

-- Create trigger to ensure only one current image per non-humanoid character
CREATE OR REPLACE FUNCTION public.update_non_humanoid_character_current_image()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- If this is being set as current, unset any other current images for this character
  IF NEW.is_current = true THEN
    UPDATE public.non_humanoid_character_images
    SET is_current = false
    WHERE character_id = NEW.character_id
    AND id != NEW.id
    AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_non_humanoid_character_current_image_trigger
  BEFORE INSERT OR UPDATE ON public.non_humanoid_character_images
  FOR EACH ROW EXECUTE FUNCTION public.update_non_humanoid_character_current_image();
