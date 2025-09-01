-- Fix security issues from previous migration

-- Fix 1: Remove SECURITY DEFINER from personas_union view and make it a regular view
DROP VIEW IF EXISTS personas_union;
CREATE VIEW personas_union AS
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

-- Fix 2: Update functions to set search_path for security
CREATE OR REPLACE FUNCTION collection_personas_validate_fk()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM v4_personas WHERE persona_id = NEW.persona_id
  ) THEN
    RAISE EXCEPTION 'persona_id % does not exist in v4_personas', NEW.persona_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION cascade_collection_personas_on_v4_delete()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM collection_personas WHERE persona_id = OLD.persona_id;
  RETURN OLD;
END;
$$;