-- Add is_public column to v4_personas table
ALTER TABLE v4_personas 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when filtering by visibility
CREATE INDEX idx_v4_personas_is_public ON v4_personas(is_public);

-- Update RLS policies to include public personas in SELECT policy
DROP POLICY IF EXISTS "Users can view their own v4_personas" ON v4_personas;

CREATE POLICY "Users can view their own v4_personas or public ones" 
ON v4_personas 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);