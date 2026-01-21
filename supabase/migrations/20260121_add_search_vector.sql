-- Migration: add_search_vector.sql
-- Task 1.2: Add full-text search vector for unified search

-- 1. Add tsvector column for full-text search
ALTER TABLE v4_personas
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create GIN index for fast text search
CREATE INDEX IF NOT EXISTS idx_v4_personas_search_vector
ON v4_personas USING GIN(search_vector);

-- 3. Create function to generate search vector from profile
CREATE OR REPLACE FUNCTION generate_persona_search_vector(
  p_name text,
  p_full_profile jsonb,
  p_background text,
  p_conversation_summary jsonb
) RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english',
    COALESCE(p_name, '') || ' ' ||
    COALESCE(p_full_profile->>'political_narrative', '') || ' ' ||
    COALESCE(p_full_profile->>'attitude_narrative', '') || ' ' ||
    COALESCE(p_full_profile->'identity'->>'occupation', '') || ' ' ||
    COALESCE(p_full_profile->'identity'->>'ethnicity', '') || ' ' ||
    COALESCE(p_background, '') || ' ' ||
    COALESCE(p_conversation_summary->>'personality_summary', '') || ' ' ||
    COALESCE(p_conversation_summary->>'motivational_summary', '') || ' ' ||
    COALESCE(p_conversation_summary->'demographics'->>'background_description', '') || ' ' ||
    COALESCE(p_full_profile->'health_profile'->>'chronic_conditions', '') || ' ' ||
    COALESCE(p_full_profile->'relationships'->>'pets', '') || ' ' ||
    COALESCE(array_to_string(
      ARRAY(SELECT jsonb_array_elements_text(
        COALESCE(p_full_profile->'daily_life'->'mental_preoccupations', '[]'::jsonb)
      )), ' '
    ), '') || ' ' ||
    COALESCE(array_to_string(
      ARRAY(SELECT jsonb_array_elements_text(
        COALESCE(p_full_profile->'motivation_profile'->'primary_motivation_labels', '[]'::jsonb)
      )), ' '
    ), '')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Populate search_vector for all existing personas
UPDATE v4_personas
SET search_vector = generate_persona_search_vector(
  name,
  full_profile,
  background,
  conversation_summary
)
WHERE search_vector IS NULL;

-- 5. Create trigger to keep search_vector updated
CREATE OR REPLACE FUNCTION update_persona_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := generate_persona_search_vector(
    NEW.name,
    NEW.full_profile,
    NEW.background,
    NEW.conversation_summary
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_update_persona_search_vector ON v4_personas;

CREATE TRIGGER trig_update_persona_search_vector
BEFORE INSERT OR UPDATE OF name, full_profile, background, conversation_summary
ON v4_personas
FOR EACH ROW
EXECUTE FUNCTION update_persona_search_vector();
