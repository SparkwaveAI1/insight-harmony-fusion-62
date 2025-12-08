-- Add indexes to speed up user-specific queries and reduce disk IO
-- These indexes help WHERE user_id = X queries avoid full table scans

CREATE INDEX IF NOT EXISTS idx_v4_personas_user_id 
ON v4_personas (user_id);

CREATE INDEX IF NOT EXISTS idx_v4_personas_user_id_created 
ON v4_personas (user_id, created_at DESC);

-- Analyze the table so the query planner uses the new indexes
ANALYZE v4_personas;