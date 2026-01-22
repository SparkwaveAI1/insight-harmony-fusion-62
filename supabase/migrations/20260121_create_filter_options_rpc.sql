-- Migration: Create get_persona_filter_options RPC function
-- Provides dynamic filter options pulled from actual database values

CREATE OR REPLACE FUNCTION get_persona_filter_options()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    'genders', (
      SELECT COALESCE(jsonb_agg(val ORDER BY cnt DESC), '[]'::jsonb)
      FROM (
        SELECT LOWER(gender_computed) as val, COUNT(*) as cnt
        FROM v4_personas
        WHERE gender_computed IS NOT NULL
        GROUP BY LOWER(gender_computed)
        ORDER BY cnt DESC
      ) t
    ),
    'ethnicities', (
      -- Limit to ethnicities with 10+ personas for cleaner dropdown
      SELECT COALESCE(jsonb_agg(val ORDER BY val), '[]'::jsonb)
      FROM (
        SELECT LOWER(ethnicity_computed) as val, COUNT(*) as cnt
        FROM v4_personas
        WHERE ethnicity_computed IS NOT NULL
        GROUP BY LOWER(ethnicity_computed)
        HAVING COUNT(*) >= 10
        ORDER BY val
      ) t
    ),
    'states', (
      SELECT COALESCE(jsonb_agg(state_region_computed ORDER BY state_region_computed), '[]'::jsonb)
      FROM (
        SELECT DISTINCT state_region_computed
        FROM v4_personas
        WHERE state_region_computed IS NOT NULL
          AND LENGTH(state_region_computed) > 2  -- Exclude 2-letter abbreviations
        ORDER BY state_region_computed
      ) t
    ),
    'countries', (
      SELECT COALESCE(jsonb_agg(DISTINCT country_computed ORDER BY country_computed), '[]'::jsonb)
      FROM v4_personas WHERE country_computed IS NOT NULL
    ),
    'education_levels', (
      -- Group education into common categories using keyword matching
      SELECT jsonb_agg(DISTINCT level ORDER BY level)
      FROM (
        SELECT unnest(ARRAY[
          'high school', 'some college', 'associate', 'bachelor',
          'master', 'doctorate', 'phd', 'mba', 'jd', 'md'
        ]) as level
      ) t
    ),
    'income_brackets', (
      -- Most common income brackets
      SELECT COALESCE(jsonb_agg(val ORDER BY sort_order), '[]'::jsonb)
      FROM (
        SELECT income_bracket as val,
               CASE
                 WHEN income_bracket LIKE '0-%' THEN 1
                 WHEN income_bracket LIKE '25000-%' THEN 2
                 WHEN income_bracket LIKE '35000-%' THEN 3
                 WHEN income_bracket LIKE '50000-%' THEN 4
                 WHEN income_bracket LIKE '75000-%' THEN 5
                 WHEN income_bracket LIKE '100000-%' THEN 6
                 WHEN income_bracket LIKE '150000-%' THEN 7
                 WHEN income_bracket LIKE '200000-%' THEN 8
                 ELSE 9
               END as sort_order,
               COUNT(*) as cnt
        FROM v4_personas
        WHERE income_bracket IS NOT NULL
        GROUP BY income_bracket
        HAVING COUNT(*) >= 20
        ORDER BY sort_order, income_bracket
      ) t
    ),
    'marital_statuses', (
      -- Core marital statuses only
      SELECT jsonb_agg(DISTINCT status ORDER BY status)
      FROM (
        SELECT unnest(ARRAY[
          'single', 'married', 'divorced', 'widowed', 'separated',
          'partnered', 'engaged', 'in a relationship', 'cohabiting'
        ]) as status
      ) t
    ),
    'interest_tags', (
      SELECT COALESCE(jsonb_agg(DISTINCT tag ORDER BY tag), '[]'::jsonb)
      FROM (SELECT DISTINCT unnest(interest_tags) as tag FROM v4_personas WHERE interest_tags IS NOT NULL) t
    ),
    'health_tags', (
      SELECT COALESCE(jsonb_agg(DISTINCT tag ORDER BY tag), '[]'::jsonb)
      FROM (SELECT DISTINCT unnest(health_tags) as tag FROM v4_personas WHERE health_tags IS NOT NULL) t
    ),
    'work_role_tags', (
      SELECT COALESCE(jsonb_agg(DISTINCT tag ORDER BY tag), '[]'::jsonb)
      FROM (SELECT DISTINCT unnest(work_role_tags) as tag FROM v4_personas WHERE work_role_tags IS NOT NULL) t
    ),
    'political_leans', (
      SELECT COALESCE(jsonb_agg(DISTINCT political_lean_computed ORDER BY political_lean_computed), '[]'::jsonb)
      FROM v4_personas WHERE political_lean_computed IS NOT NULL
    )
  );
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION get_persona_filter_options TO authenticated;
GRANT EXECUTE ON FUNCTION get_persona_filter_options TO anon;
