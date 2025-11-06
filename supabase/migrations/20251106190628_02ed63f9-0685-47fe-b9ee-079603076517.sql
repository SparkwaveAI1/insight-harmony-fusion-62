-- Add thumbnail URL support to v4_personas table
ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS profile_thumbnail_url TEXT;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_v4_personas_thumbnail_url 
ON v4_personas(profile_thumbnail_url) 
WHERE profile_thumbnail_url IS NOT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN v4_personas.profile_thumbnail_url IS 
'URL to the 400x400px thumbnail version of the profile image. Should be ~50-100KB vs 1.5MB original.';