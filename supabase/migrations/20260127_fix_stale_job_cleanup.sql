-- Fix stale job cleanup to reset to pending instead of marking as failed
-- This allows stuck items to be automatically retried instead of permanently failing

CREATE OR REPLACE FUNCTION fail_stale_persona_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset stuck items back to pending so they can be retried
  -- Only reset if they haven't been retried too many times
  UPDATE persona_creation_queue
  SET status = 'pending',
      error_message = COALESCE(error_message, '') || ' | Auto-reset: stale processing > 20m',
      processing_started_at = NULL,
      locked_at = NULL,
      updated_at = NOW()
  WHERE status LIKE 'processing%'
    AND processing_started_at < NOW() - INTERVAL '20 minutes'
    AND attempt_count < 3;  -- Only retry if not already failed 3 times

  -- Actually fail items that have been retried 3 times
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | Auto-fail: exceeded max retries (3 attempts)',
      updated_at = NOW()
  WHERE status LIKE 'processing%'
    AND processing_started_at < NOW() - INTERVAL '20 minutes'
    AND attempt_count >= 3;

  -- Log the cleanup action
  RAISE NOTICE 'Stale job cleanup complete';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION fail_stale_persona_jobs() TO postgres, service_role;
