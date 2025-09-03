-- Fix security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION fail_stale_persona_jobs() 
RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | Auto-fail: stale processing > 20m',
      updated_at = NOW()
  WHERE status LIKE 'processing%'
    AND processing_started_at < NOW() - INTERVAL '20 minutes';
END;
$$;