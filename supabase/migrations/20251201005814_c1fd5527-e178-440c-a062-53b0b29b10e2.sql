-- Create acp_jobs table for async job processing
CREATE TABLE public.acp_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_job_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  request_data JSONB NOT NULL,
  progress_data JSONB DEFAULT '{}',
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_heartbeat TIMESTAMPTZ
);

-- Indexes for efficient lookups
CREATE INDEX idx_acp_jobs_external_job_id ON public.acp_jobs(external_job_id);
CREATE INDEX idx_acp_jobs_status ON public.acp_jobs(status);

-- Enable RLS
ALTER TABLE public.acp_jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role can manage acp_jobs"
ON public.acp_jobs
FOR ALL
USING (true)
WITH CHECK (true);