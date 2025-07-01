
-- Remove overly restrictive constraints that prevent enhanced Character Lab traits
ALTER TABLE characters DROP CONSTRAINT IF EXISTS check_trait_profile_structure;

-- Add more flexible constraint that allows enhanced trait profiles for Character Lab
ALTER TABLE characters 
ADD CONSTRAINT check_trait_profile_flexible_structure 
CHECK (
  trait_profile IS NOT NULL AND
  jsonb_typeof(trait_profile) = 'object' AND
  (
    -- Allow historical characters with basic structure
    creation_source = 'historical' OR
    -- Allow creative characters with enhanced structure for Character Lab
    (creation_source = 'creative' AND trait_profile ? 'entity_type')
  )
);

-- Add index for better performance on Character Lab specific queries
CREATE INDEX IF NOT EXISTS idx_characters_creative_trait_profile 
ON characters USING GIN ((trait_profile->'cognition_model')) 
WHERE creation_source = 'creative';

CREATE INDEX IF NOT EXISTS idx_characters_creative_evolution 
ON characters USING GIN ((trait_profile->'evolution_model')) 
WHERE creation_source = 'creative';

-- Add index for appearance model queries for image generation
CREATE INDEX IF NOT EXISTS idx_characters_creative_appearance 
ON characters USING GIN ((trait_profile->'appearance_model')) 
WHERE creation_source = 'creative';

-- Ensure behavioral_modulation accepts flexible JSON for Character Lab
ALTER TABLE characters ALTER COLUMN behavioral_modulation SET DEFAULT '{}'::jsonb;

-- Ensure linguistic_profile accepts flexible JSON for Character Lab  
ALTER TABLE characters ALTER COLUMN linguistic_profile SET DEFAULT '{}'::jsonb;

-- Add comment to document the enhanced Character Lab architecture
COMMENT ON COLUMN characters.trait_profile IS 'Flexible trait profile supporting basic historical characters and enhanced Character Lab entities with cognitive models, constraint systems, and evolution tracking';
