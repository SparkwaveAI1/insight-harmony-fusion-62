-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to v4_personas
-- OpenAI's text-embedding-3-small produces 1536 dimensions
ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS profile_embedding vector(1536);

-- 3. Add a column to track when embedding was last generated
ALTER TABLE v4_personas 
ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- 4. Create an index for fast similarity search (use HNSW which is better for our scale)
CREATE INDEX IF NOT EXISTS idx_v4_personas_embedding 
ON v4_personas 
USING hnsw (profile_embedding vector_cosine_ops);

-- 5. Add a helper function for semantic search
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
  age_computed int,
  gender_computed text,
  occupation_computed text,
  city_computed text,
  state_region_computed text,
  country_computed text,
  profile_image_url text,
  conversation_summary jsonb
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
    (1 - (p.profile_embedding <=> query_embedding))::float as similarity,
    p.age_computed,
    p.gender_computed,
    p.occupation_computed,
    p.city_computed,
    p.state_region_computed,
    p.country_computed,
    p.profile_image_url,
    p.conversation_summary
  FROM v4_personas p
  WHERE p.profile_embedding IS NOT NULL
    AND p.creation_completed = true
    AND 1 - (p.profile_embedding <=> query_embedding) > match_threshold
    -- Optional: filter to personas IN a specific collection
    AND (filter_collection_id IS NULL OR EXISTS (
      SELECT 1 FROM collection_personas cp 
      WHERE cp.persona_id = p.persona_id 
      AND cp.collection_id = filter_collection_id
    ))
    -- Optional: exclude personas already in a collection
    AND (exclude_collection_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM collection_personas cp 
      WHERE cp.persona_id = p.persona_id 
      AND cp.collection_id = exclude_collection_id
    ))
  ORDER BY p.profile_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Grant access
GRANT EXECUTE ON FUNCTION search_personas_semantic TO authenticated;