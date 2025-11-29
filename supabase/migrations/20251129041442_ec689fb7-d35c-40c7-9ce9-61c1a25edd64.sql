-- Update search_personas_advanced to handle country abbreviations as a safety net
CREATE OR REPLACE FUNCTION public.search_personas_advanced(
  p_age_min integer DEFAULT NULL::integer, 
  p_age_max integer DEFAULT NULL::integer, 
  p_bmi_min numeric DEFAULT NULL::numeric, 
  p_bmi_max numeric DEFAULT NULL::numeric, 
  p_education text DEFAULT NULL::text, 
  p_location_region text DEFAULT NULL::text, 
  p_location_country text DEFAULT NULL::text, 
  p_occupation_keywords text[] DEFAULT NULL::text[], 
  p_diet_keywords text[] DEFAULT NULL::text[], 
  p_interest_keywords text[] DEFAULT NULL::text[], 
  p_lifestyle_keywords text[] DEFAULT NULL::text[], 
  p_income_bracket text DEFAULT NULL::text, 
  p_collection_ids uuid[] DEFAULT NULL::uuid[], 
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_normalized_country text;
BEGIN
  -- Normalize country abbreviations to full names
  v_normalized_country := CASE 
    WHEN p_location_country IS NULL THEN NULL
    WHEN UPPER(TRIM(p_location_country)) IN ('US', 'USA', 'U.S.', 'U.S.A.', 'AMERICA') THEN 'United States'
    WHEN UPPER(TRIM(p_location_country)) IN ('UK', 'GB', 'BRITAIN', 'GREAT BRITAIN') THEN 'United Kingdom'
    WHEN UPPER(TRIM(p_location_country)) IN ('UAE') THEN 'United Arab Emirates'
    WHEN UPPER(TRIM(p_location_country)) IN ('CA') THEN 'Canada'
    WHEN UPPER(TRIM(p_location_country)) IN ('AU') THEN 'Australia'
    WHEN UPPER(TRIM(p_location_country)) IN ('NZ') THEN 'New Zealand'
    WHEN UPPER(TRIM(p_location_country)) IN ('DE') THEN 'Germany'
    WHEN UPPER(TRIM(p_location_country)) IN ('FR') THEN 'France'
    WHEN UPPER(TRIM(p_location_country)) IN ('ES') THEN 'Spain'
    WHEN UPPER(TRIM(p_location_country)) IN ('IT') THEN 'Italy'
    WHEN UPPER(TRIM(p_location_country)) IN ('JP') THEN 'Japan'
    WHEN UPPER(TRIM(p_location_country)) IN ('CN') THEN 'China'
    WHEN UPPER(TRIM(p_location_country)) IN ('IN') THEN 'India'
    WHEN UPPER(TRIM(p_location_country)) IN ('BR') THEN 'Brazil'
    WHEN UPPER(TRIM(p_location_country)) IN ('MX') THEN 'Mexico'
    ELSE p_location_country
  END;

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
      -- Collection bonus: +2.0 PER matching collection
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
    -- Location region filter
    AND (p_location_region IS NULL OR p.full_profile->'identity'->'location'->>'region' ILIKE '%' || p_location_region || '%')
    -- Location country filter WITH NORMALIZED COUNTRY
    AND (v_normalized_country IS NULL OR p.full_profile->'identity'->'location'->>'country' ILIKE '%' || v_normalized_country || '%')
    -- Income filter
    AND (p_income_bracket IS NULL OR p.full_profile->'identity'->>'income_bracket' ILIKE '%' || p_income_bracket || '%')
    -- Diet keywords filter
    AND (p_diet_keywords IS NULL OR p.full_profile->'health_profile'->>'diet_pattern' ILIKE ANY(SELECT '%' || unnest(p_diet_keywords) || '%'))
    -- Lifestyle keywords filter
    AND (p_lifestyle_keywords IS NULL OR p.full_profile::text ILIKE ANY(SELECT '%' || unnest(p_lifestyle_keywords) || '%'))
  ORDER BY relevance_score DESC, p.created_at DESC
  LIMIT p_limit;
END;
$function$;