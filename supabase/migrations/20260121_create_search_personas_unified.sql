-- Migration: create_search_personas_unified.sql
-- Step 2: Create unified search RPC function

CREATE OR REPLACE FUNCTION search_personas_unified(
  -- Demographic filters (AND logic, uses indexed computed columns)
  p_age_min int DEFAULT NULL,
  p_age_max int DEFAULT NULL,
  p_genders text[] DEFAULT NULL,
  p_ethnicities text[] DEFAULT NULL,
  p_states text[] DEFAULT NULL,
  p_countries text[] DEFAULT NULL,
  p_cities text[] DEFAULT NULL,

  -- Household filters
  p_marital_statuses text[] DEFAULT NULL,
  p_has_children boolean DEFAULT NULL,
  p_dependents_min int DEFAULT NULL,
  p_dependents_max int DEFAULT NULL,

  -- Occupation/Income/Education
  p_occupation_contains text DEFAULT NULL,
  p_income_brackets text[] DEFAULT NULL,
  p_education_levels text[] DEFAULT NULL,

  -- Tag filters (array overlap - uses GIN indexes if available)
  p_interest_tags_any text[] DEFAULT NULL,
  p_interest_tags_all text[] DEFAULT NULL,
  p_health_tags_any text[] DEFAULT NULL,
  p_work_role_tags_any text[] DEFAULT NULL,

  -- Political filter
  p_political_leans text[] DEFAULT NULL,

  -- Full-text search (searches search_vector column)
  p_text_contains text DEFAULT NULL,
  p_text_excludes text DEFAULT NULL,

  -- Exact/partial name match
  p_name_exact text DEFAULT NULL,
  p_name_contains text DEFAULT NULL,
  p_persona_ids text[] DEFAULT NULL,

  -- Scope controls
  p_user_id uuid DEFAULT NULL,
  p_public_only boolean DEFAULT TRUE,
  p_collection_ids uuid[] DEFAULT NULL,
  p_exclude_persona_ids text[] DEFAULT NULL,

  -- Semantic search layer (optional, applied after filters)
  p_semantic_embedding vector(1536) DEFAULT NULL,
  p_semantic_threshold float DEFAULT 0.3,

  -- Pagination
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0,

  -- Sorting
  p_sort_by text DEFAULT 'name'
)
RETURNS TABLE (
  persona_id text,
  name text,
  age int,
  gender text,
  ethnicity text,
  state_region text,
  city text,
  occupation text,
  income_bracket text,
  education_level text,
  has_children boolean,
  dependents int,
  political_lean text,
  profile_image_url text,
  interest_tags text[],
  health_tags text[],
  semantic_score float,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total bigint;
BEGIN
  -- First, get total count for pagination info
  SELECT COUNT(*) INTO v_total
  FROM v4_personas p
  WHERE
    -- Visibility rules
    (
      (p_public_only = TRUE AND p.is_public = TRUE)
      OR (p_public_only = FALSE AND p_user_id IS NOT NULL AND (p.user_id = p_user_id OR p.is_public = TRUE))
      OR (p_public_only = FALSE AND p_user_id IS NULL)
    )

    -- Exact match shortcuts
    AND (p_name_exact IS NULL OR LOWER(p.name) = LOWER(p_name_exact))
    AND (p_persona_ids IS NULL OR p.persona_id = ANY(p_persona_ids))

    -- Demographic filters
    AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
    AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
    AND (p_genders IS NULL OR p.gender_computed = ANY(p_genders))
    AND (p_ethnicities IS NULL OR p.ethnicity_computed = ANY(p_ethnicities))
    AND (p_states IS NULL OR p.state_region_computed = ANY(p_states))
    AND (p_countries IS NULL OR p.country_computed = ANY(p_countries))
    AND (p_cities IS NULL OR p.city_computed = ANY(p_cities))

    -- Household filters
    AND (p_marital_statuses IS NULL OR p.marital_status_computed = ANY(p_marital_statuses))
    AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
    AND (p_dependents_min IS NULL OR p.dependents_computed >= p_dependents_min)
    AND (p_dependents_max IS NULL OR p.dependents_computed <= p_dependents_max)

    -- Occupation/Income/Education
    AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
    AND (p_income_brackets IS NULL OR p.income_bracket = ANY(p_income_brackets))
    AND (p_education_levels IS NULL OR p.education_level = ANY(p_education_levels))

    -- Tag filters (array overlap)
    AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
    AND (p_interest_tags_all IS NULL OR p.interest_tags @> p_interest_tags_all)
    AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
    AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)

    -- Political filter
    AND (p_political_leans IS NULL OR p.political_lean_computed = ANY(p_political_leans))

    -- Full-text search (inclusion)
    AND (p_text_contains IS NULL OR p.search_vector @@ plainto_tsquery('english', p_text_contains))

    -- Full-text search (exclusion)
    AND (p_text_excludes IS NULL OR NOT (p.search_vector @@ plainto_tsquery('english', p_text_excludes)))

    -- Name contains (partial match)
    AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')

    -- Collection scope
    AND (p_collection_ids IS NULL OR EXISTS (
      SELECT 1 FROM collection_personas cp
      WHERE cp.persona_id = p.persona_id
      AND cp.collection_id = ANY(p_collection_ids)
    ))

    -- Exclusions
    AND (p_exclude_persona_ids IS NULL OR p.persona_id != ALL(p_exclude_persona_ids))

    -- Semantic threshold (if embedding provided)
    AND (
      p_semantic_embedding IS NULL
      OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold
    );

  -- Return results with pagination
  RETURN QUERY
  SELECT
    p.persona_id,
    p.name,
    p.age_computed AS age,
    p.gender_computed AS gender,
    p.ethnicity_computed AS ethnicity,
    p.state_region_computed AS state_region,
    p.city_computed AS city,
    p.occupation_computed AS occupation,
    p.income_bracket,
    p.education_level,
    p.has_children_computed AS has_children,
    p.dependents_computed AS dependents,
    p.political_lean_computed AS political_lean,
    p.profile_image_url,
    p.interest_tags,
    p.health_tags,
    CASE
      WHEN p_semantic_embedding IS NOT NULL
      THEN (1 - (p.profile_embedding <=> p_semantic_embedding))::float
      ELSE NULL
    END AS semantic_score,
    v_total AS total_count
  FROM v4_personas p
  WHERE
    -- Visibility rules
    (
      (p_public_only = TRUE AND p.is_public = TRUE)
      OR (p_public_only = FALSE AND p_user_id IS NOT NULL AND (p.user_id = p_user_id OR p.is_public = TRUE))
      OR (p_public_only = FALSE AND p_user_id IS NULL)
    )

    -- Exact match shortcuts
    AND (p_name_exact IS NULL OR LOWER(p.name) = LOWER(p_name_exact))
    AND (p_persona_ids IS NULL OR p.persona_id = ANY(p_persona_ids))

    -- Demographic filters
    AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
    AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
    AND (p_genders IS NULL OR p.gender_computed = ANY(p_genders))
    AND (p_ethnicities IS NULL OR p.ethnicity_computed = ANY(p_ethnicities))
    AND (p_states IS NULL OR p.state_region_computed = ANY(p_states))
    AND (p_countries IS NULL OR p.country_computed = ANY(p_countries))
    AND (p_cities IS NULL OR p.city_computed = ANY(p_cities))

    -- Household filters
    AND (p_marital_statuses IS NULL OR p.marital_status_computed = ANY(p_marital_statuses))
    AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
    AND (p_dependents_min IS NULL OR p.dependents_computed >= p_dependents_min)
    AND (p_dependents_max IS NULL OR p.dependents_computed <= p_dependents_max)

    -- Occupation/Income/Education
    AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
    AND (p_income_brackets IS NULL OR p.income_bracket = ANY(p_income_brackets))
    AND (p_education_levels IS NULL OR p.education_level = ANY(p_education_levels))

    -- Tag filters (array overlap)
    AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
    AND (p_interest_tags_all IS NULL OR p.interest_tags @> p_interest_tags_all)
    AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
    AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)

    -- Political filter
    AND (p_political_leans IS NULL OR p.political_lean_computed = ANY(p_political_leans))

    -- Full-text search (inclusion)
    AND (p_text_contains IS NULL OR p.search_vector @@ plainto_tsquery('english', p_text_contains))

    -- Full-text search (exclusion)
    AND (p_text_excludes IS NULL OR NOT (p.search_vector @@ plainto_tsquery('english', p_text_excludes)))

    -- Name contains (partial match)
    AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')

    -- Collection scope
    AND (p_collection_ids IS NULL OR EXISTS (
      SELECT 1 FROM collection_personas cp
      WHERE cp.persona_id = p.persona_id
      AND cp.collection_id = ANY(p_collection_ids)
    ))

    -- Exclusions
    AND (p_exclude_persona_ids IS NULL OR p.persona_id != ALL(p_exclude_persona_ids))

    -- Semantic threshold (if embedding provided)
    AND (
      p_semantic_embedding IS NULL
      OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold
    )
  ORDER BY
    CASE
      WHEN p_sort_by = 'semantic' AND p_semantic_embedding IS NOT NULL
      THEN (1 - (p.profile_embedding <=> p_semantic_embedding))
      ELSE 0
    END DESC,
    CASE WHEN p_sort_by = 'name' THEN p.name END ASC,
    CASE WHEN p_sort_by = 'age' THEN p.age_computed END ASC,
    CASE WHEN p_sort_by = 'created' THEN p.created_at END DESC,
    p.name ASC  -- Default secondary sort
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_personas_unified TO authenticated;
GRANT EXECUTE ON FUNCTION search_personas_unified TO anon;
