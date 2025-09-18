-- Add enrichment tracking columns to v4_personas table
ALTER TABLE v4_personas
  ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS missing_fields TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS evidence_notes TEXT DEFAULT '';