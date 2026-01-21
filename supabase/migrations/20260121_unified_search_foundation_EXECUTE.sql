-- ============================================================================
-- UNIFIED SEARCH FOUNDATION - Combined Migration
-- Run this in Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/wgerdrdsuusnrdnwwelt/sql
-- ============================================================================

-- ============================================================================
-- TASK 1.1: Add New Computed Columns
-- ============================================================================

-- 1. Add ethnicity_computed (extract from identity)
ALTER TABLE v4_personas
ADD COLUMN IF NOT EXISTS ethnicity_computed text
GENERATED ALWAYS AS (full_profile->'identity'->>'ethnicity') STORED;

-- 2. Add dependents_computed (extract from identity as integer)
ALTER TABLE v4_personas
ADD COLUMN IF NOT EXISTS dependents_computed int
GENERATED ALWAYS AS (
  COALESCE((full_profile->'identity'->>'dependents')::int, 0)
) STORED;

-- 3. Add political_lean_computed (keyword-based extraction from political_narrative)
ALTER TABLE v4_personas
ADD COLUMN IF NOT EXISTS political_lean_computed text
GENERATED ALWAYS AS (
  CASE
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%conservative%', '%republican%', '%trump%', '%right-wing%',
      '%traditional values%', '%pro-life%', '%second amendment%'
    ])
    AND (full_profile->>'political_narrative') NOT ILIKE ANY(ARRAY[
      '%liberal%', '%progressive%', '%democrat%'
    ])
    THEN 'conservative'

    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%liberal%', '%progressive%', '%democrat%', '%left%',
      '%bernie%', '%socialist%', '%pro-choice%'
    ])
    AND (full_profile->>'political_narrative') NOT ILIKE ANY(ARRAY[
      '%conservative%', '%republican%', '%trump%'
    ])
    THEN 'liberal'

    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%moderate%', '%independent%', '%centrist%', '%both sides%', '%bipartisan%'
    ])
    THEN 'moderate'

    ELSE 'unclassified'
  END
) STORED;

-- 4. Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_v4_personas_ethnicity ON v4_personas(ethnicity_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_dependents ON v4_personas(dependents_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_political_lean ON v4_personas(political_lean_computed);


-- ============================================================================
-- TASK 1.2: Add Full-Text Search Vector
-- ============================================================================

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


-- ============================================================================
-- VERIFICATION QUERIES - Run these after the migration
-- ============================================================================

-- Verification 1.1: Check new columns exist
SELECT column_name, data_type, generation_expression
FROM information_schema.columns
WHERE table_name = 'v4_personas'
AND column_name IN ('ethnicity_computed', 'dependents_computed', 'political_lean_computed');

-- Verification 1.1: Check indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename = 'v4_personas'
AND (indexname LIKE '%ethnicity%' OR indexname LIKE '%dependents%' OR indexname LIKE '%political%');

-- Verification 1.1: Political lean distribution
SELECT
  political_lean_computed,
  COUNT(*) as count
FROM v4_personas
WHERE is_public = true
GROUP BY political_lean_computed;

-- Verification 1.1: Ethnicity distribution (top 10)
SELECT
  ethnicity_computed,
  COUNT(*) as count
FROM v4_personas
WHERE is_public = true
GROUP BY ethnicity_computed
ORDER BY count DESC
LIMIT 10;

-- Verification 1.2: Check search_vector column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'v4_personas' AND column_name = 'search_vector';

-- Verification 1.2: Check search_vector index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'v4_personas' AND indexname LIKE '%search_vector%';

-- Verification 1.2: Check trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'v4_personas'
AND trigger_name LIKE '%search_vector%';

-- Verification 1.2: Check search_vector population
SELECT
  COUNT(*) as total,
  COUNT(search_vector) as with_search_vector,
  COUNT(*) - COUNT(search_vector) as missing
FROM v4_personas;

-- Verification 1.2: Test full-text search works
SELECT name, occupation_computed, political_lean_computed
FROM v4_personas
WHERE search_vector @@ plainto_tsquery('english', 'cooking')
LIMIT 5;

-- Verification 1.3: Full computed column inventory
SELECT
  column_name,
  data_type,
  is_nullable,
  CASE WHEN generation_expression IS NOT NULL THEN 'GENERATED' ELSE 'REGULAR' END as column_type
FROM information_schema.columns
WHERE table_name = 'v4_personas'
AND column_name LIKE '%_computed'
ORDER BY column_name;

-- Verification 1.3: NULL value counts for computed columns
SELECT
  COUNT(*) as total_personas,
  COUNT(age_computed) as has_age,
  COUNT(gender_computed) as has_gender,
  COUNT(occupation_computed) as has_occupation,
  COUNT(city_computed) as has_city,
  COUNT(state_region_computed) as has_state,
  COUNT(country_computed) as has_country,
  COUNT(marital_status_computed) as has_marital,
  COUNT(has_children_computed::text) as has_children_flag,
  COUNT(ethnicity_computed) as has_ethnicity,
  COUNT(political_lean_computed) as has_political
FROM v4_personas
WHERE is_public = true;

-- Verification 1.3: All indexes on v4_personas
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'v4_personas'
ORDER BY indexname;
