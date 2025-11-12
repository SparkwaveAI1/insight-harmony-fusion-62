-- Fix collection_personas RLS: Allow anyone to view personas in public collections
CREATE POLICY "Anyone can view personas in public collections"
ON collection_personas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_personas.collection_id
    AND collections.is_public = true
  )
);

-- Fix v4_personas RLS: Allow both authenticated and anonymous users to view public personas
-- First, drop the duplicate restrictive policy
DROP POLICY IF EXISTS "Users can only view their own v4 personas" ON v4_personas;

-- Drop the old policy
DROP POLICY IF EXISTS "Authenticated users can view public personas or their own" ON v4_personas;

-- Create new policy that works for both authenticated and anonymous users
CREATE POLICY "Users can view public personas or their own"
ON v4_personas
FOR SELECT
TO public
USING (
  (auth.uid() = user_id) OR (is_public = true)
);