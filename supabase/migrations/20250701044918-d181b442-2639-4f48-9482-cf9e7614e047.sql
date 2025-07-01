
-- Remove the overly restrictive trait profile constraint
ALTER TABLE characters DROP CONSTRAINT IF EXISTS check_trait_profile_structure;

-- Add a more flexible constraint that allows for different trait profile types
ALTER TABLE characters 
ADD CONSTRAINT check_trait_profile_basic_structure 
CHECK (
  trait_profile IS NOT NULL AND
  jsonb_typeof(trait_profile) = 'object'
);

-- Add index for better performance on trait profile queries
CREATE INDEX IF NOT EXISTS idx_characters_trait_profile_type 
ON characters USING GIN ((trait_profile->'species_type')) 
WHERE trait_profile ? 'species_type';
