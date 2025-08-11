-- Drop the view first
DROP VIEW IF EXISTS projects_with_counts;

-- Create a secure function to get projects with counts
CREATE OR REPLACE FUNCTION get_user_projects_with_counts()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  information text,
  research_objectives text,
  methodology text,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  conversation_count bigint
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.information,
    p.research_objectives,
    p.methodology,
    p.user_id,
    p.created_at,
    p.updated_at,
    COALESCE(c.conversation_count, 0) as conversation_count
  FROM projects p
  LEFT JOIN (
    SELECT 
      project_id,
      COUNT(*) as conversation_count
    FROM conversations
    WHERE user_id = auth.uid()
    GROUP BY project_id
  ) c ON p.id = c.project_id
  WHERE p.user_id = auth.uid()
  ORDER BY p.updated_at DESC;
$$;