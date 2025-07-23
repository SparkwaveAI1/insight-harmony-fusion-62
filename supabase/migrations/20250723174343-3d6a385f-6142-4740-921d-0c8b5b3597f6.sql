-- Create research_reports table for storing compiled survey insights
CREATE TABLE public.research_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  insights JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own research reports" 
ON public.research_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own research reports" 
ON public.research_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research reports" 
ON public.research_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research reports" 
ON public.research_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_research_reports_updated_at
BEFORE UPDATE ON public.research_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.research_reports IS 'Compiled insights and analysis from completed survey sessions';
COMMENT ON COLUMN public.research_reports.insights IS 'JSON structure containing themes, contradictions, quotes, and AI-generated insights';