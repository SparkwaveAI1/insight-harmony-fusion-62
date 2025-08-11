-- Create optimized view for projects with conversation counts
CREATE OR REPLACE VIEW projects_with_counts AS
SELECT 
  p.*,
  COALESCE(c.conversation_count, 0) as conversation_count
FROM projects p
LEFT JOIN (
  SELECT 
    project_id,
    COUNT(*) as conversation_count
  FROM conversations
  GROUP BY project_id
) c ON p.id = c.project_id;

-- Add index on conversations.project_id for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);

-- Add index on projects.user_id for user filtering
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Add index on projects.updated_at for ordering
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);