
-- Create a table for PRSNA feedback
CREATE TABLE public.prsna_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wallet_address TEXT,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.prsna_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to INSERT their own feedback
CREATE POLICY "Users can create their own feedback" 
  ON public.prsna_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to SELECT their own feedback
CREATE POLICY "Users can view their own feedback" 
  ON public.prsna_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_prsna_feedback_updated_at
  BEFORE UPDATE ON public.prsna_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
