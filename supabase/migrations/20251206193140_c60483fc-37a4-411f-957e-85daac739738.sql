-- Add search_criteria column to collections table for saving matcher search parameters
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS search_criteria jsonb DEFAULT NULL;

COMMENT ON COLUMN collections.search_criteria IS 'Saved search criteria from collection persona matcher for re-running searches';