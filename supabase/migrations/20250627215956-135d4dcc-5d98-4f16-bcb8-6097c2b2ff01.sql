
-- Add any missing constraints or indexes for the new trait categories
-- The trait_profile column is already JSONB so it can handle the new structure
-- But let's add some validation and indexing for better performance

-- Add a check to ensure trait_profile has the expected structure
ALTER TABLE characters 
ADD CONSTRAINT check_trait_profile_structure 
CHECK (
  trait_profile ? 'big_five' AND
  trait_profile ? 'moral_foundations' AND
  trait_profile ? 'world_values' AND
  trait_profile ? 'political_compass' AND
  trait_profile ? 'behavioral_economics' AND
  trait_profile ? 'cultural_dimensions' AND
  trait_profile ? 'social_identity' AND
  trait_profile ? 'extended_traits' AND
  trait_profile ? 'dynamic_state'
);

-- Add indexes for common trait queries
CREATE INDEX IF NOT EXISTS idx_characters_trait_profile_big_five 
ON characters USING GIN ((trait_profile->'big_five'));

CREATE INDEX IF NOT EXISTS idx_characters_trait_profile_physical_appearance 
ON characters USING GIN ((trait_profile->'physical_appearance'));

CREATE INDEX IF NOT EXISTS idx_characters_trait_profile_physical_health 
ON characters USING GIN ((trait_profile->'physical_health'));

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_characters_metadata_historical_period 
ON characters USING GIN ((metadata->'historical_period'));

CREATE INDEX IF NOT EXISTS idx_characters_metadata_region 
ON characters USING GIN ((metadata->'region'));
