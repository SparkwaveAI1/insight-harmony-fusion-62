-- Add enrichment_status column to personas table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'incomplete';