-- Make project_id optional in conversations table
ALTER TABLE public.conversations 
ALTER COLUMN project_id DROP NOT NULL;