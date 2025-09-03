-- Step 4.1: Manual sweep - fail stale processing rows (20-minute TTL)
UPDATE persona_creation_queue
SET status = 'failed',
    error_message = COALESCE(error_message, '') || ' | Auto-fail: stale processing > 20m',
    updated_at = NOW()
WHERE status LIKE 'processing%'
  AND processing_started_at < NOW() - INTERVAL '20 minutes';

-- Step 4.2: Create function for automatic cleanup
CREATE OR REPLACE FUNCTION fail_stale_persona_jobs() 
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | Auto-fail: stale processing > 20m',
      updated_at = NOW()
  WHERE status LIKE 'processing%'
    AND processing_started_at < NOW() - INTERVAL '20 minutes';
END;
$$;