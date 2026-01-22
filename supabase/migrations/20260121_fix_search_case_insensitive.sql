-- Migration: Fix search_personas_unified to use case-insensitive matching
-- Issue: Filter panel returning only 2 results instead of hundreds
-- Root cause: Exact case-sensitive matching for gender, ethnicity, marital status, education

CREATE OR REPLACE FUNCTION search_personas_unified(
  -- Demographics
  p_age_min integer DEFAULT NULL,
  p_age_max integer DEFAULT NULL,
  p_genders text[] DEFAULT NULL,
  p_ethnicities text[] DEFAULT NULL,
  p_states text[] DEFAULT NULL,
  p_countries text[] DEFAULT NULL,
  p_cities text[] DEFAULT NULL,

  -- Household
  p_marital_statuses text[] DEFAULT NULL,
  p_has_children boolean DEFAULT NULL,
  p_dependents_min integer DEFAULT NULL,
  p_dependents_max integer DEFAULT NULL,

  -- Occupation/Income/Education
  p_occupation_contains text DEFAULT NULL,
  p_income_brackets text[] DEFAULT NULL,
  p_education_levels text[] DEFAULT NULL,

  -- Tags
  p_interest_tags_any text[] DEFAULT NULL,
  p_interest_tags_all text[] DEFAULT NULL,
  p_health_tags_any text[] DEFAULT NULL,
  p_work_role_tags_any text[] DEFAULT NULL,

  -- Political
  p_political_leans text[] DEFAULT NULL,

  -- Text search
  p_text_contains text DEFAULT NULL,
  p_text_excludes text DEFAULT NULL,

  -- Name matching
  p_name_exact text DEFAULT NULL,
  p_name_contains text DEFAULT NULL,

  -- Identity
  p_persona_ids text[] DEFAULT NULL,

  -- Scope
  p_user_id uuid DEFAULT NULL,
  p_public_only boolean DEFAULT TRUE,
  p_collection_ids uuid[] DEFAULT NULL,
  p_exclude_persona_ids text[] DEFAULT NULL,

  -- Semantic search
  p_semantic_embedding vector DEFAULT NULL,
  p_semantic_threshold float DEFAULT 0.3,

  -- Pagination
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_sort_by text DEFAULT 'name'
)
RETURNS TABLE (
  persona_id text,
  name text,
  age integer,
  gender text,
  ethnicity text,
  state_region text,
  city text,
  occupation text,
  income_bracket text,
  education_level text,
  has_children boolean,
  dependents integer,
  political_lean text,
  profile_image_url text,
  profile_thumbnail_url text,
  interest_tags text[],
  health_tags text[],
  created_at timestamptz,
  background text,
  is_public boolean,
  semantic_score float,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total bigint;
  v_genders_lower text[];
  v_ethnicities_lower text[];
  v_marital_lower text[];
  v_education_lower text[];
  v_political_lower text[];
BEGIN
  -- Pre-process arrays to lowercase for case-insensitive matching
  IF p_genders IS NOT NULL THEN
    SELECT array_agg(LOWER(x)) INTO v_genders_lower FROM UNNEST(p_genders) AS x;
  END IF;

  IF p_ethnicities IS NOT NULL THEN
    SELECT array_agg(LOWER(x)) INTO v_ethnicities_lower FROM UNNEST(p_ethnicities) AS x;
  END IF;

  IF p_marital_statuses IS NOT NULL THEN
    SELECT array_agg(LOWER(x)) INTO v_marital_lower FROM UNNEST(p_marital_statuses) AS x;
  END IF;

  IF p_education_levels IS NOT NULL THEN
    SELECT array_agg(LOWER(x)) INTO v_education_lower FROM UNNEST(p_education_levels) AS x;
  END IF;

  IF p_political_leans IS NOT NULL THEN
    SELECT array_agg(LOWER(x)) INTO v_political_lower FROM UNNEST(p_political_leans) AS x;
  END IF;

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

    -- Demographic filters (CASE INSENSITIVE)
    AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
    AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
    AND (v_genders_lower IS NULL OR LOWER(p.gender_computed) = ANY(v_genders_lower))
    AND (v_ethnicities_lower IS NULL OR LOWER(p.ethnicity_computed) = ANY(v_ethnicities_lower))
    AND (p_states IS NULL OR p.state_region_computed = ANY(p_states))
    AND (p_countries IS NULL OR p.country_computed = ANY(p_countries))
    AND (p_cities IS NULL OR p.city_computed = ANY(p_cities))

    -- Household filters (CASE INSENSITIVE for marital status)
    AND (v_marital_lower IS NULL OR LOWER(p.marital_status_computed) = ANY(v_marital_lower))
    AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
    AND (p_dependents_min IS NULL OR p.dependents_computed >= p_dependents_min)
    AND (p_dependents_max IS NULL OR p.dependents_computed <= p_dependents_max)

    -- Occupation/Income/Education (education uses ILIKE for partial matching)
    AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
    AND (p_income_brackets IS NULL OR p.income_bracket = ANY(p_income_brackets))
    AND (v_education_lower IS NULL OR EXISTS (
      SELECT 1 FROM UNNEST(v_education_lower) AS edu
      WHERE LOWER(p.education_level) LIKE '%' || edu || '%'
    ))

    -- Tag filters (array overlap)
    AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
    AND (p_interest_tags_all IS NULL OR p.interest_tags @> p_interest_tags_all)
    AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
    AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)

    -- Political filter (CASE INSENSITIVE)
    AND (v_political_lower IS NULL OR LOWER(p.political_lean_computed) = ANY(v_political_lower))

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
    p.profile_thumbnail_url,
    p.interest_tags,
    p.health_tags,
    p.created_at,
    p.background,
    p.is_public,
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

    -- Demographic filters (CASE INSENSITIVE)
    AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
    AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
    AND (v_genders_lower IS NULL OR LOWER(p.gender_computed) = ANY(v_genders_lower))
    AND (v_ethnicities_lower IS NULL OR LOWER(p.ethnicity_computed) = ANY(v_ethnicities_lower))
    AND (p_states IS NULL OR p.state_region_computed = ANY(p_states))
    AND (p_countries IS NULL OR p.country_computed = ANY(p_countries))
    AND (p_cities IS NULL OR p.city_computed = ANY(p_cities))

    -- Household filters (CASE INSENSITIVE for marital status)
    AND (v_marital_lower IS NULL OR LOWER(p.marital_status_computed) = ANY(v_marital_lower))
    AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
    AND (p_dependents_min IS NULL OR p.dependents_computed >= p_dependents_min)
    AND (p_dependents_max IS NULL OR p.dependents_computed <= p_dependents_max)

    -- Occupation/Income/Education (education uses ILIKE for partial matching)
    AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
    AND (p_income_brackets IS NULL OR p.income_bracket = ANY(p_income_brackets))
    AND (v_education_lower IS NULL OR EXISTS (
      SELECT 1 FROM UNNEST(v_education_lower) AS edu
      WHERE LOWER(p.education_level) LIKE '%' || edu || '%'
    ))

    -- Tag filters (array overlap)
    AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
    AND (p_interest_tags_all IS NULL OR p.interest_tags @> p_interest_tags_all)
    AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
    AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)

    -- Political filter (CASE INSENSITIVE)
    AND (v_political_lower IS NULL OR LOWER(p.political_lean_computed) = ANY(v_political_lower))

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
    CASE WHEN p_sort_by = 'name' THEN p.name END ASC,
    CASE WHEN p_sort_by = 'age' THEN p.age_computed END ASC,
    CASE WHEN p_sort_by = 'created_at' THEN p.created_at END DESC,
    CASE WHEN p_sort_by = 'semantic' AND p_semantic_embedding IS NOT NULL
         THEN (1 - (p.profile_embedding <=> p_semantic_embedding)) END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_personas_unified TO anon, authenticated, service_role;
