-- Create surveys table for reusable question templates
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey_sessions table to track individual survey instances
CREATE TABLE public.survey_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey_responses table for individual question responses
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.survey_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  persona_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for surveys
CREATE POLICY "Users can view their own surveys" ON public.surveys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own surveys" ON public.surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own surveys" ON public.surveys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own surveys" ON public.surveys FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for survey_sessions
CREATE POLICY "Users can view their own survey sessions" ON public.survey_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own survey sessions" ON public.survey_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own survey sessions" ON public.survey_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own survey sessions" ON public.survey_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for survey_responses
CREATE POLICY "Users can view responses from their survey sessions" ON public.survey_responses 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.survey_sessions 
  WHERE survey_sessions.id = survey_responses.session_id 
  AND survey_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can create responses for their survey sessions" ON public.survey_responses 
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.survey_sessions 
  WHERE survey_sessions.id = survey_responses.session_id 
  AND survey_sessions.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_survey_sessions_updated_at
  BEFORE UPDATE ON public.survey_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();