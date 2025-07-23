-- Add research_context column to research_survey_sessions table
-- This will store processed and summarized document content for survey sessions

ALTER TABLE public.research_survey_sessions 
ADD COLUMN research_context jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.research_survey_sessions.research_context IS 'Processed and summarized project documents that provide context for survey responses';