
-- Create the project-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents', 
  'project-documents', 
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'text/csv',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/markdown'
  ]
);

-- Create RLS policies for the project-documents bucket
CREATE POLICY "Users can upload project documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'project-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their project documents" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'project-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their project documents" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'project-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their project documents" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'project-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS and create policies for knowledge_base_documents table
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view knowledge base documents for their projects" 
  ON public.knowledge_base_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = knowledge_base_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create knowledge base documents for their projects" 
  ON public.knowledge_base_documents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = knowledge_base_documents.project_id 
      AND projects.user_id = auth.uid()
    )
    AND auth.uid() = uploaded_by
  );

CREATE POLICY "Users can update knowledge base documents for their projects" 
  ON public.knowledge_base_documents 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = knowledge_base_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete knowledge base documents for their projects" 
  ON public.knowledge_base_documents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = knowledge_base_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );
