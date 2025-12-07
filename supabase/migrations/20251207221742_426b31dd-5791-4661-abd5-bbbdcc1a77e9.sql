DROP FUNCTION IF EXISTS search_personas_semantic(vector, double precision, integer, uuid, uuid);

CREATE OR REPLACE FUNCTION search_personas_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 50,
  filter_collection_id uuid DEFAULT NULL,
  exclude_collection_id uuid DEFAULT NULL
)
RETURNS TABLE (
  persona_id text,
  name text,
  similarity float,
  user_id uuid,
  is_public boolean,
  created_at timestamptz,
  full_profile jsonb,
  conversation_summary jsonb,
  profile_image_url text,
  profile_thumbnail_url text,
  age_computed int,
  gender_computed text,
  occupation_computed text,
  city_computed text,
  state_region_computed text,
  country_computed text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.persona_id,
    p.name,
    1 - (p.profile_embedding <=> query_embedding) as similarity,
    p.user_id,
    p.is_public,
    p.created_at,
    p.full_profile,
    p.conversation_summary,
    p.profile_image_url,
    p.profile_thumbnail_url,
    p.age_computed,
    p.gender_computed,
    p.occupation_computed,
    p.city_computed,
    p.state_region_computed,
    p.country_computed
  FROM v4_personas p
  WHERE p.profile_embedding IS NOT NULL
    AND p.creation_completed = true
    AND 1 - (p.profile_embedding <=> query_embedding) > match_threshold
    AND (filter_collection_id IS NULL OR EXISTS (
      SELECT 1 FROM collection_personas cp 
      WHERE cp.persona_id = p.persona_id 
      AND cp.collection_id = filter_collection_id
    ))
    AND (exclude_collection_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM collection_personas cp 
      WHERE cp.persona_id = p.persona_id 
      AND cp.collection_id = exclude_collection_id
    ))
  ORDER BY p.profile_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_personas_semantic TO authenticated;