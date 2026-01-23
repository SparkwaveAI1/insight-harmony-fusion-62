-- Fix sorting in search_personas_unified to properly sort by created_at DESC

CREATE OR REPLACE FUNCTION search_personas_unified(
  -- Pagination
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0,
  
  -- Scope
  p_public_only boolean DEFAULT true,
  p_user_id uuid DEFAULT NULL,
  p_collection_ids uuid[] DEFAULT NULL,
  
  -- Demographics
  p_age_min int DEFAULT NULL,
  p_age_max int DEFAULT NULL,
  p_genders text[] DEFAULT NULL,
  p_ethnicities text[] DEFAULT NULL,
  p_states text[] DEFAULT NULL,
  
  -- Household
  p_has_children boolean DEFAULT NULL,
  p_marital_statuses text[] DEFAULT NULL,
  
  -- Occupation/Education
  p_occupation_contains text DEFAULT NULL,
  p_income_brackets text[] DEFAULT NULL,
  p_education_levels text[] DEFAULT NULL,
  
  -- Tags (ANY match)
  p_interest_tags_any text[] DEFAULT NULL,
  p_health_tags_any text[] DEFAULT NULL,
  p_work_role_tags_any text[] DEFAULT NULL,
  
  -- Political
  p_political_leans text[] DEFAULT NULL,
  
  -- Text search
  p_text_contains text DEFAULT NULL,
  p_text_excludes text DEFAULT NULL,
  
  -- Name search
  p_name_contains text DEFAULT NULL,
  
  -- Semantic search
  p_semantic_embedding vector(1536) DEFAULT NULL,
  p_semantic_threshold float DEFAULT 0.5,
  
  -- Sorting
  p_sort_by text DEFAULT 'created'
)
RETURNS TABLE (
  persona_id uuid,
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
SET search_path = public
AS $$
DECLARE
  v_total bigint;
BEGIN
  -- Get total count first (without pagination)
  SELECT COUNT(*) INTO v_total
  FROM v4_personas p
  LEFT JOIN collection_personas cp ON cp.persona_id = p.persona_id
  WHERE
    -- Scope filters
    (NOT p_public_only OR p.is_public = true)
    AND (p_user_id IS NULL OR p.user_id = p_user_id)
    AND (p_collection_ids IS NULL OR cp.collection_id = ANY(p_collection_ids))
    
    -- Demographics
    AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
    AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
    AND (p_genders IS NULL OR p.gender_computed ILIKE ANY(
      SELECT '%' || unnest(p_genders) || '%'
    ))
    AND (p_ethnicities IS NULL OR p.ethnicity_computed ILIKE ANY(
      SELECT '%' || unnest(p_ethnicities) || '%'
    ))
    AND (p_states IS NULL OR p.state_computed ILIKE ANY(
      SELECT '%' || unnest(p_states) || '%'
    ))
    
    -- Household
    AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
    AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(
      SELECT '%' || unnest(p_marital_statuses) || '%'
    ))
    
    -- Occupation/Education
    AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
    AND (p_income_brackets IS NULL OR p.income_bracket_computed ILIKE ANY(
      SELECT '%' || unnest(p_income_brackets) || '%'
    ))
    AND (p_education_levels IS NULL OR p.education_level_computed ILIKE ANY(
      SELECT '%' || unnest(p_education_levels) || '%'
    ))
    
    -- Tags
    AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
    AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
    AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
    
    -- Political
    AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(
      SELECT '%' || unnest(p_political_leans) || '%'
    ))
    
    -- Text search
    AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
    AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
    
    -- Name search
    AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
    
    -- Semantic threshold
    AND (
      p_semantic_embedding IS NULL
      OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold
    );

  -- Return results with sorting based on p_sort_by
  IF p_sort_by = 'semantic' AND p_semantic_embedding IS NOT NULL THEN
    RETURN QUERY
    SELECT
      p.persona_id,
      p.name,
      p.age_computed,
      p.gender_computed,
      p.ethnicity_computed,
      p.state_computed,
      p.city_computed,
      p.occupation_computed,
      p.income_bracket_computed,
      p.education_level_computed,
      p.has_children_computed,
      p.dependents_computed,
      p.political_lean_computed,
      p.profile_image_url,
      p.profile_thumbnail_url,
      p.interest_tags,
      p.health_tags,
      p.created_at,
      p.background,
      p.is_public,
      (1 - (p.profile_embedding <=> p_semantic_embedding))::float AS semantic_score,
      v_total
    FROM v4_personas p
    LEFT JOIN collection_personas cp ON cp.persona_id = p.persona_id
    WHERE
      (NOT p_public_only OR p.is_public = true)
      AND (p_user_id IS NULL OR p.user_id = p_user_id)
      AND (p_collection_ids IS NULL OR cp.collection_id = ANY(p_collection_ids))
      AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
      AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
      AND (p_genders IS NULL OR p.gender_computed ILIKE ANY(SELECT '%' || unnest(p_genders) || '%'))
      AND (p_ethnicities IS NULL OR p.ethnicity_computed ILIKE ANY(SELECT '%' || unnest(p_ethnicities) || '%'))
      AND (p_states IS NULL OR p.state_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
      AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
      AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
      AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
      AND (p_income_brackets IS NULL OR p.income_bracket_computed ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
      AND (p_education_levels IS NULL OR p.education_level_computed ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
      AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
      AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
      AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
      AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
      AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
      AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
      AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
      AND (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold
    ORDER BY (1 - (p.profile_embedding <=> p_semantic_embedding)) DESC
    LIMIT p_limit
    OFFSET p_offset;
    
  ELSIF p_sort_by = 'name' THEN
    RETURN QUERY
    SELECT
      p.persona_id,
      p.name,
      p.age_computed,
      p.gender_computed,
      p.ethnicity_computed,
      p.state_computed,
      p.city_computed,
      p.occupation_computed,
      p.income_bracket_computed,
      p.education_level_computed,
      p.has_children_computed,
      p.dependents_computed,
      p.political_lean_computed,
      p.profile_image_url,
      p.profile_thumbnail_url,
      p.interest_tags,
      p.health_tags,
      p.created_at,
      p.background,
      p.is_public,
      NULL::float AS semantic_score,
      v_total
    FROM v4_personas p
    LEFT JOIN collection_personas cp ON cp.persona_id = p.persona_id
    WHERE
      (NOT p_public_only OR p.is_public = true)
      AND (p_user_id IS NULL OR p.user_id = p_user_id)
      AND (p_collection_ids IS NULL OR cp.collection_id = ANY(p_collection_ids))
      AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
      AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
      AND (p_genders IS NULL OR p.gender_computed ILIKE ANY(SELECT '%' || unnest(p_genders) || '%'))
      AND (p_ethnicities IS NULL OR p.ethnicity_computed ILIKE ANY(SELECT '%' || unnest(p_ethnicities) || '%'))
      AND (p_states IS NULL OR p.state_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
      AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
      AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
      AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
      AND (p_income_brackets IS NULL OR p.income_bracket_computed ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
      AND (p_education_levels IS NULL OR p.education_level_computed ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
      AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
      AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
      AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
      AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
      AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
      AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
      AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
      AND (p_semantic_embedding IS NULL OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold)
    ORDER BY p.name ASC
    LIMIT p_limit
    OFFSET p_offset;
    
  ELSE
    -- Default: sort by created_at DESC (most recent first)
    RETURN QUERY
    SELECT
      p.persona_id,
      p.name,
      p.age_computed,
      p.gender_computed,
      p.ethnicity_computed,
      p.state_computed,
      p.city_computed,
      p.occupation_computed,
      p.income_bracket_computed,
      p.education_level_computed,
      p.has_children_computed,
      p.dependents_computed,
      p.political_lean_computed,
      p.profile_image_url,
      p.profile_thumbnail_url,
      p.interest_tags,
      p.health_tags,
      p.created_at,
      p.background,
      p.is_public,
      NULL::float AS semantic_score,
      v_total
    FROM v4_personas p
    LEFT JOIN collection_personas cp ON cp.persona_id = p.persona_id
    WHERE
      (NOT p_public_only OR p.is_public = true)
      AND (p_user_id IS NULL OR p.user_id = p_user_id)
      AND (p_collection_ids IS NULL OR cp.collection_id = ANY(p_collection_ids))
      AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
      AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
      AND (p_genders IS NULL OR p.gender_computed ILIKE ANY(SELECT '%' || unnest(p_genders) || '%'))
      AND (p_ethnicities IS NULL OR p.ethnicity_computed ILIKE ANY(SELECT '%' || unnest(p_ethnicities) || '%'))
      AND (p_states IS NULL OR p.state_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
      AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
      AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
      AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
      AND (p_income_brackets IS NULL OR p.income_bracket_computed ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
      AND (p_education_levels IS NULL OR p.education_level_computed ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
      AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
      AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
      AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
      AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
      AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
      AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
      AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
      AND (p_semantic_embedding IS NULL OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
  END IF;
END;
$$;
