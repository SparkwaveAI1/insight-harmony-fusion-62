-- Drop the existing personas table and recreate with clean V3 structure
DROP TABLE IF EXISTS public.personas CASCADE;

-- Create the clean V3 personas table
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- V3 persona data structure (single JSONB field)
  persona_data JSONB NOT NULL DEFAULT '{}',
  
  -- Additional metadata
  profile_image_url TEXT,
  prompt TEXT,
  version TEXT DEFAULT '3.0'
);

-- Enable RLS
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own personas or public ones" 
ON public.personas 
FOR SELECT 
USING ((user_id = auth.uid()) OR (is_public = true));

CREATE POLICY "Users can create their own personas" 
ON public.personas 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own personas" 
ON public.personas 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own personas" 
ON public.personas 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personas_updated_at
BEFORE UPDATE ON public.personas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();