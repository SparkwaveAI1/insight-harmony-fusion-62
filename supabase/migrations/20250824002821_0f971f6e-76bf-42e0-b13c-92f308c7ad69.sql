-- Fix search path security warnings for the functions
DROP FUNCTION IF EXISTS find_orphaned_persona_references();
DROP FUNCTION IF EXISTS cleanup_orphaned_persona_references();

-- Create a function to find orphaned persona references with proper search path
CREATE OR REPLACE FUNCTION find_orphaned_persona_references()
RETURNS TABLE(collection_id uuid, persona_id text, collection_name text) 
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    cp.collection_id,
    cp.persona_id,
    c.name as collection_name
  FROM collection_personas cp
  JOIN collections c ON c.id = cp.collection_id
  LEFT JOIN v4_personas v4 ON v4.persona_id = cp.persona_id
  WHERE v4.persona_id IS NULL;
$$;

-- Create a function to clean up all orphaned references with proper search path
CREATE OR REPLACE FUNCTION cleanup_orphaned_persona_references()
RETURNS TABLE(cleaned_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH deleted AS (
    DELETE FROM collection_personas 
    WHERE persona_id NOT IN (
      SELECT persona_id FROM v4_personas
    )
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted;
$$;