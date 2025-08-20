-- Add persona_version column to support V3 format
ALTER TABLE personas_v2 ADD COLUMN persona_version TEXT NOT NULL DEFAULT '2.1';

-- Add check constraint to ensure valid versions
ALTER TABLE personas_v2 ADD CONSTRAINT valid_persona_version 
  CHECK (persona_version IN ('2.0', '2.1', '3.0'));

-- Create index for better performance when filtering by version
CREATE INDEX idx_personas_v2_version ON personas_v2(persona_version);

-- Update existing records to version 2.1
UPDATE personas_v2 SET persona_version = '2.1' WHERE persona_version = '2.1';