-- Step 1: Create safe public view with only display-level fields
CREATE VIEW v4_personas_public_safe AS
SELECT 
  persona_id,
  name,
  profile_image_url,
  created_at,
  user_id,
  is_public,
  schema_version,
  conversation_summary,
  -- Extract safe display fields
  (conversation_summary->>'character_description') as character_description,
  (conversation_summary->'demographics'->>'age') as age,
  (conversation_summary->'demographics'->>'location') as location,
  (full_profile->'identity'->>'occupation') as occupation
FROM v4_personas
WHERE is_public = true;

-- Grant access to authenticated users
GRANT SELECT ON v4_personas_public_safe TO authenticated;

-- Step 2: Update RLS on v4_personas to owner-only
DROP POLICY IF EXISTS "Users can view their own v4 personas or public ones" ON v4_personas;

CREATE POLICY "Users can only view their own v4 personas"
ON v4_personas FOR SELECT
TO authenticated
USING (auth.uid() = user_id);