-- Phase 1: One-time cleanup - remove orphaned persona references
-- This will fix the "count shows >0 but list is empty" issue immediately

-- First, let's see what orphaned entries exist (for logging)
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM collection_personas cp
    LEFT JOIN v4_personas v4 ON v4.persona_id = cp.persona_id
    WHERE v4.persona_id IS NULL;
    
    RAISE NOTICE 'Found % orphaned collection_personas entries to clean up', orphan_count;
END $$;

-- Delete the orphaned entries
DELETE FROM collection_personas cp
WHERE NOT EXISTS (
  SELECT 1 FROM v4_personas v4 
  WHERE v4.persona_id = cp.persona_id
);

-- Phase 2: Create personas union view for consistent cross-table joins
CREATE OR REPLACE VIEW personas_union AS
SELECT 
  v4.persona_id AS id, 
  'v4' AS source, 
  v4.user_id, 
  v4.is_public, 
  v4.created_at,
  v4.name,
  v4.profile_image_url
FROM v4_personas v4
WHERE v4.creation_completed = true;

-- Phase 2: Add unique constraint to prevent duplicate persona-collection relationships (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'collection_personas_unique'
    ) THEN
        ALTER TABLE collection_personas
        ADD CONSTRAINT collection_personas_unique 
        UNIQUE (collection_id, persona_id);
    END IF;
END $$;

-- Phase 2: Add validation trigger to prevent invalid persona_id inserts
CREATE OR REPLACE FUNCTION collection_personas_validate_fk()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM v4_personas WHERE persona_id = NEW.persona_id
  ) THEN
    RAISE EXCEPTION 'persona_id % does not exist in v4_personas', NEW.persona_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_collection_personas_validate_fk ON collection_personas;
CREATE TRIGGER trg_collection_personas_validate_fk
BEFORE INSERT OR UPDATE ON collection_personas
FOR EACH ROW EXECUTE FUNCTION collection_personas_validate_fk();

-- Phase 2: Add cascade delete trigger to clean up when personas are deleted
CREATE OR REPLACE FUNCTION cascade_collection_personas_on_v4_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM collection_personas WHERE persona_id = OLD.persona_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_v4_persona_delete_cascade ON v4_personas;
CREATE TRIGGER trg_v4_persona_delete_cascade
AFTER DELETE ON v4_personas
FOR EACH ROW EXECUTE FUNCTION cascade_collection_personas_on_v4_delete();