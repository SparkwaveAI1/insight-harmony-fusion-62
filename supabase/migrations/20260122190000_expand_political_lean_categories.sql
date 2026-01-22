-- Migration: Expand political_lean_computed to include more categories
-- Categories (in extraction order - most specific first):
-- far_left, progressive, liberal, center_left, moderate, center_right, conservative, far_right, libertarian, apolitical

-- Drop the existing column and index
DROP INDEX IF EXISTS idx_v4_personas_political_lean;
ALTER TABLE v4_personas DROP COLUMN IF EXISTS political_lean_computed;

-- Recreate with expanded categories
ALTER TABLE v4_personas
ADD COLUMN political_lean_computed text
GENERATED ALWAYS AS (
  CASE
    -- Far Left: socialist, marxist, communist, anarchist, radical left, far left
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%socialist%', '%marxist%', '%communist%', '%anarchist%',
      '%radical left%', '%far left%', '%far-left%'
    ])
    AND (full_profile->>'political_narrative') NOT ILIKE '%democratic socialist%'
    THEN 'far_left'

    -- Progressive: progressive, bernie, warren, AOC, democratic socialist
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%progressive%', '%bernie%', '%warren%', '%aoc%',
      '%alexandria ocasio%', '%democratic socialist%', '%squad%'
    ])
    THEN 'progressive'

    -- Libertarian: libertarian, free market, small government, rand paul (check before conservative)
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%libertarian%', '%free market%', '%small government%',
      '%rand paul%', '%ron paul%', '%limited government%'
    ])
    THEN 'libertarian'

    -- Far Right: far right, alt-right, maga, trump, nationalist, america first
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%far right%', '%far-right%', '%alt-right%', '%alt right%',
      '%maga%', '%trump%', '%nationalist%', '%america first%',
      '%white nationalist%', '%qanon%', '%patriot movement%'
    ])
    THEN 'far_right'

    -- Center Left: center-left, moderate democrat, biden
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%center-left%', '%center left%', '%moderate democrat%',
      '%biden%', '%mainstream democrat%', '%establishment democrat%'
    ])
    THEN 'center_left'

    -- Center Right: center-right, moderate republican, RINO
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%center-right%', '%center right%', '%moderate republican%',
      '%rino%', '%never trump%', '%mainstream republican%'
    ])
    THEN 'center_right'

    -- Apolitical: apolitical, not political, don't follow politics, disengaged
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%apolitical%', '%not political%', '%non-political%', '%nonpolitical%',
      '%don''t follow politics%', '%doesn''t follow politics%',
      '%disengaged%', '%politically disengaged%', '%no interest in politics%',
      '%avoids politics%', '%stays out of politics%'
    ])
    THEN 'apolitical'

    -- Moderate: moderate, centrist, independent, both sides, bipartisan, swing voter
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%moderate%', '%centrist%', '%independent%', '%both sides%',
      '%bipartisan%', '%swing voter%', '%middle of the road%',
      '%neither party%', '%votes for the person%'
    ])
    AND (full_profile->>'political_narrative') NOT ILIKE ANY(ARRAY[
      '%moderate democrat%', '%moderate republican%'
    ])
    THEN 'moderate'

    -- Liberal: liberal, democrat (but not moderate democrat, and not already matched)
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%liberal%', '%democrat%', '%left-leaning%', '%left leaning%',
      '%pro-choice%', '%supports democrats%'
    ])
    AND (full_profile->>'political_narrative') NOT ILIKE ANY(ARRAY[
      '%conservative%', '%republican%', '%moderate democrat%'
    ])
    THEN 'liberal'

    -- Conservative: conservative, republican (but not moderate republican, not trump/maga)
    WHEN (full_profile->>'political_narrative') ILIKE ANY(ARRAY[
      '%conservative%', '%republican%', '%right-leaning%', '%right leaning%',
      '%traditional values%', '%pro-life%', '%second amendment%', '%gop%'
    ])
    AND (full_profile->>'political_narrative') NOT ILIKE ANY(ARRAY[
      '%liberal%', '%democrat%', '%moderate republican%',
      '%trump%', '%maga%', '%far right%'
    ])
    THEN 'conservative'

    ELSE 'unclassified'
  END
) STORED;

-- Recreate index
CREATE INDEX idx_v4_personas_political_lean ON v4_personas(political_lean_computed);
