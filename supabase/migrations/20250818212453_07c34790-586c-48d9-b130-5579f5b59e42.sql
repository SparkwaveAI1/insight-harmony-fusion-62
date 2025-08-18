-- Create personas_v2 table for the new PersonaV2 schema
CREATE TABLE public.personas_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  persona_data JSONB NOT NULL, -- Full PersonaV2 interface
  persona_type TEXT NOT NULL DEFAULT 'humanoid',
  is_public BOOLEAN NOT NULL DEFAULT false,
  profile_image_url TEXT,
  voicepack_runtime JSONB, -- Cached voicepack data
  voicepack_hash TEXT, -- Hash for cache invalidation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personas_v2 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own personas or public ones" 
ON public.personas_v2 
FOR SELECT 
USING ((user_id = auth.uid()) OR (is_public = true));

CREATE POLICY "Users can create their own personas" 
ON public.personas_v2 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own personas" 
ON public.personas_v2 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own personas" 
ON public.personas_v2 
FOR DELETE 
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_personas_v2_user_id ON public.personas_v2(user_id);
CREATE INDEX idx_personas_v2_persona_id ON public.personas_v2(persona_id);
CREATE INDEX idx_personas_v2_persona_type ON public.personas_v2(persona_type);
CREATE INDEX idx_personas_v2_is_public ON public.personas_v2(is_public);
CREATE INDEX idx_personas_v2_voicepack_hash ON public.personas_v2(voicepack_hash) WHERE voicepack_hash IS NOT NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personas_v2_updated_at
BEFORE UPDATE ON public.personas_v2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();