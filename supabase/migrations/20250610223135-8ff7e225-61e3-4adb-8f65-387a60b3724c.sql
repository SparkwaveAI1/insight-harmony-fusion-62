
-- Check if RLS policies exist for projects table and add them if missing
-- Add Row Level Security policies for projects table (if not already present)

-- First ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Users can view their own projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create their own projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update their own projects" 
  ON public.projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects" 
  ON public.projects 
  FOR DELETE 
  USING (auth.uid() = user_id);
