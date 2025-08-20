-- Update database constraint to only allow version 3.0
ALTER TABLE personas_v2 
DROP CONSTRAINT IF EXISTS check_persona_version;

-- Add constraint to only allow version 3.0
ALTER TABLE personas_v2 
ADD CONSTRAINT check_persona_version 
CHECK (persona_version = '3.0');

-- Update default to 3.0
ALTER TABLE personas_v2 
ALTER COLUMN persona_version SET DEFAULT '3.0';