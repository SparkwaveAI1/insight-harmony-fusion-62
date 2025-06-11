
-- Add knowledge base functionality to projects (already exists but let's ensure it's properly set up)
-- The knowledge_base_documents table already exists and references projects

-- Create junction table for project-collection relationships
CREATE TABLE IF NOT EXISTS public.project_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, collection_id)
);

-- Add project information fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS information TEXT,
ADD COLUMN IF NOT EXISTS research_objectives TEXT,
ADD COLUMN IF NOT EXISTS methodology TEXT;

-- Enable RLS on project_collections
ALTER TABLE public.project_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_collections using DO blocks to handle existing policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist and recreate them
  DROP POLICY IF EXISTS "Users can view their project collections" ON public.project_collections;
  DROP POLICY IF EXISTS "Users can manage their project collections" ON public.project_collections;

  -- Create policies for project_collections
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

  -- Handle knowledge_base_documents policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'knowledge_base_documents' 
    AND policyname = 'Users can view their project documents'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'knowledge_base_documents' 
    AND policyname = 'Users can manage their project documents'
  ) THEN
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
  END IF;
END $$;
