-- Drop the persona_v2 table and all its associated objects
DROP TABLE IF EXISTS persona_v2 CASCADE;

-- Drop the trigger function if it exists and is not used elsewhere
-- (keeping it safe since it might be used by other tables)
-- DROP FUNCTION IF EXISTS set_updated_at() CASCADE;