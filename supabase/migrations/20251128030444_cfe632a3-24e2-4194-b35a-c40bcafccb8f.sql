-- Update search_personas_advanced to score +2.0 PER matching collection
-- instead of flat +2.0 for being in ANY matching collection

CREATE OR REPLACE FUNCTION public.search_personas_advanced(
  p_age_min integer DEFAULT NULL,
  p_age_max integer DEFAULT NULL,
  p_bmi_min numeric DEFAULT NULL,
  p_bmi_max numeric DEFAULT NULL,
  p_education text DEFAULT NULL,
  p_location_region text DEFAULT NULL,
  p_location_country text DEFAULT NULL,
  p_occupation_keywords text[] DEFAULT NULL,
  p_diet_keywords text[] DEFAULT NULL,
  p_interest_keywords text[] DEFAULT NULL,
  p_lifestyle_keywords text[] DEFAULT NULL,
  p_income_bracket text DEFAULT NULL,
  p_collection_ids uuid[] DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  persona_id text,
  name text,
  relevance_score numeric,
  profile_image_url text,
  full_profile jsonb,
  conversation_summary jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.persona_id,
    p.name,
    (
      -- Base score
      1.0
      -- Age match bonus
      + CASE WHEN p_age_min IS NOT NULL OR p_age_max IS NOT NULL THEN
          CASE WHEN 
            (p_age_min IS NULL OR (p.full_profile->'identity'->>'age')::int >= p_age_min) AND
            (p_age_max IS NULL OR (p.full_profile->'identity'->>'age')::int <= p_age_max)
          THEN 1.0 ELSE 0 END
        ELSE 0 END
      -- BMI match bonus
      + CASE WHEN p_bmi_min IS NOT NULL OR p_bmi_max IS NOT NULL THEN
          CASE WHEN 
            (p_bmi_min IS NULL OR COALESCE((p.full_profile->'health_profile'->>'bmi')::numeric, 
              CASE (p.full_profile->'health_profile'->>'bmi_category')
                WHEN 'underweight' THEN 17.5
                WHEN 'normal' THEN 22.0
                WHEN 'overweight' THEN 27.5
                WHEN 'obese' THEN 32.0
                ELSE NULL
              END) >= p_bmi_min) AND
            (p_bmi_max IS NULL OR COALESCE((p.full_profile->'health_profile'->>'bmi')::numeric,
              CASE (p.full_profile->'health_profile'->>'bmi_category')
                WHEN 'underweight' THEN 17.5
                WHEN 'normal' THEN 22.0
                WHEN 'overweight' THEN 27.5
                WHEN 'obese' THEN 32.0
                ELSE NULL
              END) <= p_bmi_max)
          THEN 1.5 ELSE 0 END
        ELSE 0 END
      -- Collection bonus: +2.0 PER matching collection (not flat +2.0)
      + COALESCE((
          SELECT COUNT(DISTINCT cp.collection_id)::numeric * 2.0
          FROM collection_personas cp 
          WHERE cp.persona_id = p.persona_id 
          AND p_collection_ids IS NOT NULL 
          AND array_length(p_collection_ids, 1) > 0
          AND cp.collection_id = ANY(p_collection_ids)
        ), 0)
      -- Keyword match bonuses
      + CASE WHEN p_occupation_keywords IS NOT NULL AND 
          p.full_profile->'identity'->>'occupation' ILIKE ANY(SELECT '%' || unnest(p_occupation_keywords) || '%')
        THEN 1.0 ELSE 0 END
      + CASE WHEN p_interest_keywords IS NOT NULL AND 
          p.full_profile::text ILIKE ANY(SELECT '%' || unnest(p_interest_keywords) || '%')
        THEN 0.5 ELSE 0 END
    )::numeric AS relevance_score,
    p.profile_image_url,
    p.full_profile,
    p.conversation_summary
  FROM v4_personas p
  WHERE 
    p.is_public = true
    AND p.creation_completed = true
    -- Age filter
    AND (p_age_min IS NULL OR (p.full_profile->'identity'->>'age')::int >= p_age_min)
    AND (p_age_max IS NULL OR (p.full_profile->'identity'->>'age')::int <= p_age_max)
    -- BMI filter (with fallback to bmi_category)
    AND (p_bmi_min IS NULL OR COALESCE(
      (p.full_profile->'health_profile'->>'bmi')::numeric,
      CASE (p.full_profile->'health_profile'->>'bmi_category')
        WHEN 'underweight' THEN 17.5
        WHEN 'normal' THEN 22.0
        WHEN 'overweight' THEN 27.5
        WHEN 'obese' THEN 32.0
        ELSE NULL
      END
    ) >= p_bmi_min)
    AND (p_bmi_max IS NULL OR COALESCE(
      (p.full_profile->'health_profile'->>'bmi')::numeric,
      CASE (p.full_profile->'health_profile'->>'bmi_category')
        WHEN 'underweight' THEN 17.5
        WHEN 'normal' THEN 22.0
        WHEN 'overweight' THEN 27.5
        WHEN 'obese' THEN 32.0
        ELSE NULL
      END
    ) <= p_bmi_max)
    -- Education filter
    AND (p_education IS NULL OR p.full_profile->'identity'->>'education_level' ILIKE '%' || p_education || '%')
    -- Location filters
    AND (p_location_region IS NULL OR p.full_profile->'identity'->'location'->>'region' ILIKE '%' || p_location_region || '%')
    AND (p_location_country IS NULL OR p.full_profile->'identity'->'location'->>'country' ILIKE '%' || p_location_country || '%')
    -- Income filter
    AND (p_income_bracket IS NULL OR p.full_profile->'identity'->>'income_bracket' ILIKE '%' || p_income_bracket || '%')
    -- Diet keywords filter
    AND (p_diet_keywords IS NULL OR p.full_profile->'health_profile'->>'diet_pattern' ILIKE ANY(SELECT '%' || unnest(p_diet_keywords) || '%'))
    -- Lifestyle keywords filter
    AND (p_lifestyle_keywords IS NULL OR p.full_profile::text ILIKE ANY(SELECT '%' || unnest(p_lifestyle_keywords) || '%'))
  ORDER BY relevance_score DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$;