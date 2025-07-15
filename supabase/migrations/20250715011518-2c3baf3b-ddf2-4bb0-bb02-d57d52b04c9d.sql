-- Create research_surveys table to store survey data linked to projects
CREATE TABLE public.research_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
);

-- Create research_survey_sessions table to track survey execution
CREATE TABLE public.research_survey_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_survey_id UUID NOT NULL REFERENCES public.research_surveys(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  selected_personas TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create research_survey_responses table to store persona responses
CREATE TABLE public.research_survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.research_survey_sessions(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.research_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_survey_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for research_surveys
CREATE POLICY "Users can create their own research surveys"
ON public.research_surveys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own research surveys"
ON public.research_surveys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own research surveys"
ON public.research_surveys
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research surveys"
ON public.research_surveys
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for research_survey_sessions
CREATE POLICY "Users can create their own research survey sessions"
ON public.research_survey_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own research survey sessions"
ON public.research_survey_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own research survey sessions"
ON public.research_survey_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research survey sessions"
ON public.research_survey_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for research_survey_responses
CREATE POLICY "Users can create responses for their research survey sessions"
ON public.research_survey_responses
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.research_survey_sessions 
  WHERE id = research_survey_responses.session_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can view responses from their research survey sessions"
ON public.research_survey_responses
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.research_survey_sessions 
  WHERE id = research_survey_responses.session_id 
  AND user_id = auth.uid()
));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_research_surveys_updated_at
  BEFORE UPDATE ON public.research_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_survey_sessions_updated_at
  BEFORE UPDATE ON public.research_survey_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();