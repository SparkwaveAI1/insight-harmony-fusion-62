
-- Update the personas table to ensure it can handle the enhanced metadata structure
-- Add a comment to document the enhanced metadata version
COMMENT ON COLUMN public.personas.metadata IS 'Enhanced persona metadata including relationships_family structure (version 2+)';

-- Update the default value for enhanced_metadata_version to ensure new personas use version 2
ALTER TABLE public.personas ALTER COLUMN enhanced_metadata_version SET DEFAULT 2;

-- Add an index on enhanced_metadata_version for better query performance
CREATE INDEX IF NOT EXISTS idx_personas_enhanced_metadata_version 
ON public.personas(enhanced_metadata_version);

-- Add a partial index for personas with relationship data for faster filtering
CREATE INDEX IF NOT EXISTS idx_personas_with_relationships 
ON public.personas USING GIN ((metadata->'relationships_family')) 
WHERE metadata ? 'relationships_family';
