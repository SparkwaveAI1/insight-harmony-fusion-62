-- Migration: add_search_computed_columns.sql
-- Task 1.1: Add new computed columns for unified search

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
