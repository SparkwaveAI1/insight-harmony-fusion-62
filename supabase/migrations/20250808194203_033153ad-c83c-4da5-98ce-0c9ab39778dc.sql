-- Create table for reusable question sets scoped to a project
CREATE TABLE IF NOT EXISTS public.project_question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_question_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: restrict access to project owners
CREATE POLICY "Users can view their project question sets"
ON public.project_question_sets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert project question sets"
ON public.project_question_sets
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their project question sets"
ON public.project_question_sets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their project question sets"
ON public.project_question_sets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  )
);

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_project_question_sets_updated_at ON public.project_question_sets;
CREATE TRIGGER trg_project_question_sets_updated_at
BEFORE UPDATE ON public.project_question_sets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_project_question_sets_project ON public.project_question_sets(project_id);
