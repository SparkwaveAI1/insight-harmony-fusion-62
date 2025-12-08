-- Create table for search validation logs
CREATE TABLE IF NOT EXISTS acp_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  original_query TEXT NOT NULL,
  requested_count INT NOT NULL,
  attempts JSONB NOT NULL,
  final_success BOOLEAN NOT NULL,
  personas_selected INT NOT NULL,
  rejection_reason TEXT,
  total_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analysis
CREATE INDEX idx_acp_search_logs_success ON acp_search_logs(final_success);
CREATE INDEX idx_acp_search_logs_created ON acp_search_logs(created_at);

-- Enable RLS
ALTER TABLE acp_search_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert logs
CREATE POLICY "Service role can insert search logs"
ON acp_search_logs FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to read logs (for debugging/analysis)
CREATE POLICY "Authenticated users can read search logs"
ON acp_search_logs FOR SELECT
USING (auth.role() = 'authenticated');