-- PAI-001: Persona Response Quality Tracking
-- Enables recursive self-improvement by tracking response quality

CREATE TABLE IF NOT EXISTS persona_response_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id TEXT NOT NULL,
  conversation_id TEXT,
  
  -- Message content
  user_message TEXT,
  response TEXT,
  
  -- Quality signals
  explicit_rating INTEGER CHECK (explicit_rating IN (-1, 0, 1)), -- thumbs down, neutral, thumbs up
  reply_received BOOLEAN DEFAULT false,
  conversation_continued BOOLEAN DEFAULT false,
  
  -- Auto-calculated metrics
  response_length INTEGER,
  
  -- Metadata
  model_used TEXT,
  provider_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance queries
CREATE INDEX idx_prq_persona_id ON persona_response_quality(persona_id);
CREATE INDEX idx_prq_created_at ON persona_response_quality(created_at DESC);
CREATE INDEX idx_prq_rating ON persona_response_quality(explicit_rating) WHERE explicit_rating IS NOT NULL;

-- Summary view for analysis
CREATE OR REPLACE VIEW persona_quality_summary AS
SELECT 
  persona_id,
  COUNT(*) as total_responses,
  COUNT(CASE WHEN explicit_rating = 1 THEN 1 END) as positive_ratings,
  COUNT(CASE WHEN explicit_rating = -1 THEN 1 END) as negative_ratings,
  COUNT(CASE WHEN reply_received THEN 1 END) as replies_received,
  AVG(response_length) as avg_response_length,
  MAX(created_at) as last_response_at
FROM persona_response_quality
GROUP BY persona_id;

COMMENT ON TABLE persona_response_quality IS 'Tracks response quality for PersonaAI self-improvement';
