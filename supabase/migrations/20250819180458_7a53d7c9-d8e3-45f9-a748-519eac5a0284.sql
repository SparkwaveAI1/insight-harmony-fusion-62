-- Add new columns for enhanced PersonaV2 builder outputs
ALTER TABLE personas_v2 
ADD COLUMN IF NOT EXISTS linguistic_style JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS state_modifiers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trait_to_language_map JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS group_behavior JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reasoning_modifiers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS runtime_controls JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS validation_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS builder_metadata JSONB DEFAULT '{}';

-- Add index for better performance on voicepack queries
CREATE INDEX IF NOT EXISTS idx_personas_v2_voicepack_hash ON personas_v2(voicepack_hash) WHERE voicepack_hash IS NOT NULL;

-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_personas_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_personas_v2_updated_at_trigger ON personas_v2;
CREATE TRIGGER update_personas_v2_updated_at_trigger
  BEFORE UPDATE ON personas_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_personas_v2_updated_at();