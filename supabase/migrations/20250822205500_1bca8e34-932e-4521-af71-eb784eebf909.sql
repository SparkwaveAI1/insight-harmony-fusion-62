-- Phase 1: Clean up legacy personas table and related components

-- Drop RLS policies for personas table
DROP POLICY IF EXISTS "Users can create their own personas" ON public.personas;
DROP POLICY IF EXISTS "Users can delete their own personas" ON public.personas;
DROP POLICY IF EXISTS "Users can update their own personas" ON public.personas;
DROP POLICY IF EXISTS "Users can view their own personas or public ones" ON public.personas;

-- Drop triggers related to personas table
DROP TRIGGER IF EXISTS update_personas_updated_at ON public.personas;

-- Drop the empty personas table
DROP TABLE IF EXISTS public.personas CASCADE;

-- Remove any foreign key constraints that might reference personas table in collection_personas
-- Since collection_personas.persona_id is text (not UUID), it likely references v4_personas.persona_id anyway
-- But let's be explicit about cleaning up the schema

-- Update collection_personas to ensure it's properly referencing v4_personas only
COMMENT ON COLUMN public.collection_personas.persona_id IS 'References v4_personas.persona_id (text format)';