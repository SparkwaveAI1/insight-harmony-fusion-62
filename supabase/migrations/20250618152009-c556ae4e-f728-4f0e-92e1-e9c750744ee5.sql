
-- Update the personas table to ensure all new fields are properly supported
-- Add any missing columns for enhanced health and physical description data
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS enhanced_metadata_version INTEGER DEFAULT 2;

-- Create an index on the enhanced metadata version for better query performance
CREATE INDEX IF NOT EXISTS idx_personas_enhanced_metadata 
ON personas(enhanced_metadata_version);

-- Update the persona_images table to better support physical description
ALTER TABLE persona_images 
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS physical_attributes JSONB DEFAULT '{}';

-- Add index for better performance when querying by physical attributes
CREATE INDEX IF NOT EXISTS idx_persona_images_physical_attributes 
ON persona_images USING GIN (physical_attributes);
