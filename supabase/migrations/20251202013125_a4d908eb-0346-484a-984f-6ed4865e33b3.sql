-- Create table for ACP delivery diagnostics
CREATE TABLE acp_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL,
  attempt_type text,
  payload_type text,
  payload_size_bytes integer,
  payload_keys text[],
  study_results_keys text[],
  summary_report_keys text[],
  has_qualitative_report boolean,
  full_payload_preview text,
  deliver_error text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE acp_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (for edge function)
CREATE POLICY "Service role can insert logs"
ON acp_delivery_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to read logs
CREATE POLICY "Authenticated users can read logs"
ON acp_delivery_logs
FOR SELECT
TO authenticated
USING (true);

-- Create index for faster queries
CREATE INDEX idx_acp_delivery_logs_job_id ON acp_delivery_logs(job_id);
CREATE INDEX idx_acp_delivery_logs_created_at ON acp_delivery_logs(created_at DESC);