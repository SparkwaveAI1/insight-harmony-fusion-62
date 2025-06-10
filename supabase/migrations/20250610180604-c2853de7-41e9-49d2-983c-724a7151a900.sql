
-- First, let's ensure we have all the necessary tables and relationships for Projects

-- Add a project_id column to conversations table to link conversations to projects
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create a junction table to link projects with collections (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.project_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, collection_id)
);

-- Create a knowledge_base_documents table for storing documents/files linked to projects
CREATE TABLE IF NOT EXISTS public.knowledge_base_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for project_collections
ALTER TABLE public.project_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their project collections" 
  ON public.project_collections 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_collections.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their project collections" 
  ON public.project_collections 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_collections.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Add RLS policies for knowledge_base_documents
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their project documents" 
  ON public.knowledge_base_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = knowledge_base_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their project documents" 
  ON public.knowledge_base_documents 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = knowledge_base_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Update conversations RLS policy to work with project_id
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at for knowledge_base_documents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER knowledge_base_documents_updated_at
  BEFORE UPDATE ON public.knowledge_base_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
