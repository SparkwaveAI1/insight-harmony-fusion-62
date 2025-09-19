-- Add statistical enhancement tracking columns to v4_personas
ALTER TABLE v4_personas ADD COLUMN statistical_enhancement_status text DEFAULT 'pending';
ALTER TABLE v4_personas ADD COLUMN enhancement_applied_at timestamp with time zone;

-- Create index for efficient querying by status
CREATE INDEX idx_v4_personas_enhancement_status ON v4_personas(statistical_enhancement_status);

-- Update existing complete personas to have 'complete' status
UPDATE v4_personas 
SET statistical_enhancement_status = 'complete' 
WHERE full_profile IS NOT NULL 
  AND jsonb_typeof(full_profile) = 'object'
  AND full_profile != 'null'::jsonb
  AND full_profile != '{}'::jsonb;