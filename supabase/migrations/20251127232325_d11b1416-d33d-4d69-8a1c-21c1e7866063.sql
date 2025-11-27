
-- Fix ambiguous column reference in search_personas_advanced
DROP FUNCTION IF EXISTS public.search_personas_advanced;

CREATE OR REPLACE FUNCTION public.search_personas_advanced(
  p_age_min int DEFAULT NULL,
  p_age_max int DEFAULT NULL,
  p_bmi_min float DEFAULT NULL,
  p_bmi_max float DEFAULT NULL,
  p_education text DEFAULT NULL,
  p_location_region text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_occupation_keywords text[] DEFAULT NULL,
  p_diet_keywords text[] DEFAULT NULL,
  p_interest_keywords text[] DEFAULT NULL,
  p_lifestyle_keywords text[] DEFAULT NULL,
  p_income_bracket text DEFAULT NULL,
  p_collection_ids uuid[] DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  persona_id text,
  name text,
  full_profile jsonb,
  conversation_summary jsonb,
  profile_image_url text,
  relevance_score float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH scored_personas AS (
    SELECT 
      p.persona_id,
      p.name,
      p.full_profile,
      p.conversation_summary,
      p.profile_image_url,
      -- Calculate relevance score
      (
        -- Base score
        1.0
        -- Boost for collection membership (+2.0)
        + CASE WHEN p_collection_ids IS NOT NULL AND array_length(p_collection_ids, 1) > 0 AND EXISTS (
            SELECT 1 FROM collection_personas cp 
            WHERE cp.persona_id = p.persona_id 
            AND cp.collection_id = ANY(p_collection_ids)
          ) THEN 2.0 ELSE 0 END
        -- Boost for interest keyword matches (+0.5 each)
        + COALESCE((
          SELECT COUNT(*)::float * 0.5 
          FROM unnest(p_interest_keywords) kw 
          WHERE p.full_profile::text ILIKE '%' || kw || '%'
        ), 0)
        -- Boost for lifestyle keyword matches (+0.3 each)
        + COALESCE((
          SELECT COUNT(*)::float * 0.3
          FROM unnest(p_lifestyle_keywords) kw
          WHERE p.full_profile::text ILIKE '%' || kw || '%'
        ), 0)
        -- Boost for diet keyword matches (+0.3 each)
        + COALESCE((
          SELECT COUNT(*)::float * 0.3
          FROM unnest(p_diet_keywords) kw
          WHERE p.full_profile->'health_profile'->>'diet_pattern' ILIKE '%' || kw || '%'
        ), 0)
        -- Boost for occupation keyword matches (+0.4 each)
        + COALESCE((
          SELECT COUNT(*)::float * 0.4
          FROM unnest(p_occupation_keywords) kw
          WHERE p.full_profile->'identity'->>'occupation' ILIKE '%' || kw || '%'
        ), 0)
      )::float as score
    FROM v4_personas p
    WHERE p.is_public = true
      -- Age filters
      AND (p_age_min IS NULL OR (p.full_profile->'identity'->>'age')::int >= p_age_min)
      AND (p_age_max IS NULL OR (p.full_profile->'identity'->>'age')::int <= p_age_max)
      -- BMI filters
      AND (p_bmi_min IS NULL OR (p.full_profile->'health_profile'->>'bmi')::float >= p_bmi_min)
      AND (p_bmi_max IS NULL OR (p.full_profile->'health_profile'->>'bmi')::float <= p_bmi_max)
      -- Education filter (partial match)
      AND (p_education IS NULL OR lower(p.full_profile->'identity'->>'education_level') ILIKE '%' || lower(p_education) || '%')
      -- Location filters
      AND (p_location_region IS NULL OR lower(p.full_profile->'identity'->'location'->>'region') ILIKE '%' || lower(p_location_region) || '%')
      AND (p_location_country IS NULL OR lower(p.full_profile->'identity'->'location'->>'country') ILIKE '%' || lower(p_location_country) || '%')
      -- Income filter
      AND (p_income_bracket IS NULL OR lower(p.full_profile->'identity'->>'income_bracket') ILIKE '%' || lower(p_income_bracket) || '%')
      -- At least one interest keyword must match (if provided)
      AND (p_interest_keywords IS NULL OR array_length(p_interest_keywords, 1) IS NULL OR EXISTS (
        SELECT 1 FROM unnest(p_interest_keywords) kw 
        WHERE p.full_profile::text ILIKE '%' || kw || '%'
      ))
  )
  SELECT 
    sp.persona_id,
    sp.name,
    sp.full_profile,
    sp.conversation_summary,
    sp.profile_image_url,
    sp.score as relevance_score
  FROM scored_personas sp
  WHERE sp.score > 0
  ORDER BY sp.score DESC
  LIMIT p_limit;
END;
$$;
