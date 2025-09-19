-- Add tracking columns for statistical enhancement
ALTER TABLE v4_personas ADD COLUMN statistical_enhancement_status text DEFAULT 'pending';
ALTER TABLE v4_personas ADD COLUMN enhancement_applied_at timestamp with time zone;

-- Add index for efficient querying of conversion status
CREATE INDEX idx_v4_personas_enhancement_status ON v4_personas(statistical_enhancement_status);

-- Update existing complete personas to 'complete' status
UPDATE v4_personas 
SET statistical_enhancement_status = 'complete'
WHERE creation_completed = true 
  AND full_profile_data ? 'health_profile' 
  AND full_profile_data ? 'money_profile'
  AND full_profile_data ? 'adoption_profile';