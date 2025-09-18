-- Add enrichment_status column to v4_personas table
ALTER TABLE v4_personas ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'incomplete';