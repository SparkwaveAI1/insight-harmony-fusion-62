-- Allow public SELECT access to acp_jobs by external_job_id
-- This enables ACP buyers to view their research results via the public URL

CREATE POLICY "Public can view completed acp_jobs results"
ON acp_jobs FOR SELECT
USING (status = 'completed');