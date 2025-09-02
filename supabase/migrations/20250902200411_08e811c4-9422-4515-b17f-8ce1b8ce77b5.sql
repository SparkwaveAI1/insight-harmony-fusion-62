-- Create persona_creation_queue table
CREATE TABLE public.persona_creation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  collections TEXT[] NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  persona_id TEXT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  priority INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.persona_creation_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can create their own queue items"
ON public.persona_creation_queue
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own queue items"
ON public.persona_creation_queue
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue items"
ON public.persona_creation_queue
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue items"
ON public.persona_creation_queue
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_persona_creation_queue_user_id ON public.persona_creation_queue (user_id);
CREATE INDEX idx_persona_creation_queue_status ON public.persona_creation_queue (status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_persona_creation_queue_updated_at
  BEFORE UPDATE ON public.persona_creation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();