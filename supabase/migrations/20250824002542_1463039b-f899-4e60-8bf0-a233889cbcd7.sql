-- Remove orphaned persona references from collections
DELETE FROM collection_personas 
WHERE persona_id IN (
  'bc74c6e0-168b-47f7-a162-73e8d85a361e', 
  '0aec1da0-8d9f-4f40-b84f-274d69d7c884'
);

-- Create a function to find orphaned persona references
CREATE OR REPLACE FUNCTION find_orphaned_persona_references()
RETURNS TABLE(collection_id uuid, persona_id text, collection_name text) 
LANGUAGE sql
SECURITY DEFINER
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

-- Create a function to clean up all orphaned references
CREATE OR REPLACE FUNCTION cleanup_orphaned_persona_references()
RETURNS TABLE(cleaned_count bigint)
LANGUAGE sql
SECURITY DEFINER
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