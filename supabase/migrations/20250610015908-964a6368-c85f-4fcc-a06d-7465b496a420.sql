
-- Create table for structured study sessions
CREATE TABLE public.structured_study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'launched')),
  current_step INTEGER NOT NULL DEFAULT 1,
  study_goal JSONB,
  research_format JSONB,
  audience_definition JSONB,
  output_goals JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.structured_study_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own study sessions
CREATE POLICY "Users can view their own study sessions" 
  ON public.structured_study_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own study sessions
CREATE POLICY "Users can create their own study sessions" 
  ON public.structured_study_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own study sessions
CREATE POLICY "Users can update their own study sessions" 
  ON public.structured_study_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own study sessions
CREATE POLICY "Users can delete their own study sessions" 
  ON public.structured_study_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at
CREATE TRIGGER structured_study_sessions_updated_at
  BEFORE UPDATE ON public.structured_study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
