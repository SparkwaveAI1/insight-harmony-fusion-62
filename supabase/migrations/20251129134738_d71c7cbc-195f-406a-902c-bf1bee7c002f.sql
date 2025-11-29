-- Phase 1: ACP Search Rebuild - Database Schema Enhancement
-- Adds flattened indexed columns and tag arrays for fast filtering

-- 1.1 Add generated columns for demographics (computed from full_profile)
ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS age_computed int GENERATED ALWAYS AS ((full_profile->'identity'->>'age')::int) STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS gender_computed text GENERATED ALWAYS AS (full_profile->'identity'->>'gender') STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS marital_status_computed text GENERATED ALWAYS AS (full_profile->'identity'->>'relationship_status') STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS has_children_computed boolean GENERATED ALWAYS AS (COALESCE((full_profile->'identity'->>'dependents')::int, 0) > 0) STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS country_computed text GENERATED ALWAYS AS (full_profile->'identity'->'location'->>'country') STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS state_region_computed text GENERATED ALWAYS AS (full_profile->'identity'->'location'->>'region') STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS city_computed text GENERATED ALWAYS AS (full_profile->'identity'->'location'->>'city') STORED;

ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS occupation_computed text GENERATED ALWAYS AS (full_profile->'identity'->>'occupation') STORED;

-- 1.2 Add tag arrays for GIN indexing (populated by trigger on insert/update)
ALTER TABLE v4_personas ADD COLUMN IF NOT EXISTS interest_tags text[] DEFAULT '{}';
ALTER TABLE v4_personas ADD COLUMN IF NOT EXISTS health_tags text[] DEFAULT '{}';
ALTER TABLE v4_personas ADD COLUMN IF NOT EXISTS work_role_tags text[] DEFAULT '{}';
ALTER TABLE v4_personas ADD COLUMN IF NOT EXISTS industry_tags text[] DEFAULT '{}';
ALTER TABLE v4_personas ADD COLUMN IF NOT EXISTS buying_style_tags text[] DEFAULT '{}';

-- 1.3 Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_v4_personas_age ON v4_personas(age_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_gender ON v4_personas(gender_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_country ON v4_personas(country_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_state_region ON v4_personas(state_region_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_city ON v4_personas(city_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_occupation ON v4_personas(occupation_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_marital ON v4_personas(marital_status_computed);
CREATE INDEX IF NOT EXISTS idx_v4_personas_has_children ON v4_personas(has_children_computed);

-- GIN indexes for tag arrays
CREATE INDEX IF NOT EXISTS idx_v4_personas_interest_tags ON v4_personas USING GIN(interest_tags);
CREATE INDEX IF NOT EXISTS idx_v4_personas_health_tags ON v4_personas USING GIN(health_tags);
CREATE INDEX IF NOT EXISTS idx_v4_personas_work_role_tags ON v4_personas USING GIN(work_role_tags);
CREATE INDEX IF NOT EXISTS idx_v4_personas_industry_tags ON v4_personas USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_v4_personas_buying_style_tags ON v4_personas USING GIN(buying_style_tags);

-- 1.4 Create the Stage 1 hard filter RPC
CREATE OR REPLACE FUNCTION public.search_personas_stage1(
  -- Demographics
  p_age_min int DEFAULT NULL,
  p_age_max int DEFAULT NULL,
  p_gender text[] DEFAULT NULL,
  p_marital_status text[] DEFAULT NULL,
  p_has_children boolean DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_state_region text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_occupation_keywords text[] DEFAULT NULL,
  -- Tags (hard filters)
  p_interest_tags text[] DEFAULT NULL,
  p_health_tags text[] DEFAULT NULL,
  p_work_role_tags text[] DEFAULT NULL,
  p_industry_tags text[] DEFAULT NULL,
  -- Collection filter
  p_collection_ids uuid[] DEFAULT NULL,
  -- Limits
  p_limit int DEFAULT 500
)
RETURNS TABLE(
  persona_id text,
  name text,
  age_computed int,
  gender_computed text,
  country_computed text,
  state_region_computed text,
  city_computed text,
  occupation_computed text,
  marital_status_computed text,
  has_children_computed boolean,
  interest_tags text[],
  health_tags text[],
  work_role_tags text[],
  profile_image_url text,
  full_profile jsonb,
  conversation_summary jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_normalized_country text;
BEGIN
  -- Normalize country abbreviations
  v_normalized_country := CASE 
    WHEN p_country IS NULL THEN NULL
    WHEN UPPER(TRIM(p_country)) IN ('US', 'USA', 'U.S.', 'U.S.A.', 'AMERICA') THEN 'United States'
    WHEN UPPER(TRIM(p_country)) IN ('UK', 'GB', 'BRITAIN', 'GREAT BRITAIN') THEN 'United Kingdom'
    WHEN UPPER(TRIM(p_country)) IN ('UAE') THEN 'United Arab Emirates'
    WHEN UPPER(TRIM(p_country)) IN ('CA') THEN 'Canada'
    WHEN UPPER(TRIM(p_country)) IN ('AU') THEN 'Australia'
    ELSE p_country
  END;

  RETURN QUERY
  SELECT 
    p.persona_id,
    p.name,
    p.age_computed,
    p.gender_computed,
    p.country_computed,
    p.state_region_computed,
    p.city_computed,
    p.occupation_computed,
    p.marital_status_computed,
    p.has_children_computed,
    p.interest_tags,
    p.health_tags,
    p.work_role_tags,
    p.profile_image_url,
    p.full_profile,
    p.conversation_summary
  FROM v4_personas p
  WHERE 
    p.is_public = true
    AND p.creation_completed = true
    -- Age filter (hard)
    AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
    AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
    -- Gender filter (hard)
    AND (p_gender IS NULL OR p.gender_computed = ANY(p_gender) OR p.gender_computed ILIKE ANY(p_gender))
    -- Marital status filter (hard)
    AND (p_marital_status IS NULL OR p.marital_status_computed ILIKE ANY(p_marital_status))
    -- Has children filter (hard)
    AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
    -- Location filters (hard)
    AND (v_normalized_country IS NULL OR p.country_computed ILIKE '%' || v_normalized_country || '%')
    AND (p_state_region IS NULL OR p.state_region_computed ILIKE '%' || p_state_region || '%')
    AND (p_city IS NULL OR p.city_computed ILIKE '%' || p_city || '%')
    -- Occupation filter (hard) - ANY keyword must match
    AND (p_occupation_keywords IS NULL OR p.occupation_computed ILIKE ANY(SELECT '%' || unnest(p_occupation_keywords) || '%'))
    -- Tag filters (hard) - persona must have ALL specified tags
    AND (p_interest_tags IS NULL OR p.interest_tags @> p_interest_tags)
    AND (p_health_tags IS NULL OR p.health_tags @> p_health_tags)
    AND (p_work_role_tags IS NULL OR p.work_role_tags @> p_work_role_tags)
    AND (p_industry_tags IS NULL OR p.industry_tags @> p_industry_tags)
    -- Collection filter (if specified, persona must be in at least one)
    AND (p_collection_ids IS NULL OR array_length(p_collection_ids, 1) IS NULL OR EXISTS (
      SELECT 1 FROM collection_personas cp 
      WHERE cp.persona_id = p.persona_id 
      AND cp.collection_id = ANY(p_collection_ids)
    ))
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$;