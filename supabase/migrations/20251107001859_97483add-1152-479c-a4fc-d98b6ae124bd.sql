-- Update fail_stale_persona_jobs to DELETE instead of marking as failed
CREATE OR REPLACE FUNCTION public.fail_stale_persona_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete stale processing jobs (older than 20 minutes) instead of marking failed
  DELETE FROM persona_creation_queue
  WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3')
    AND processing_started_at < NOW() - INTERVAL '20 minutes';
    
  -- Delete jobs that have been locked but never started processing
  DELETE FROM persona_creation_queue
  WHERE status = 'processing'
    AND locked_at IS NOT NULL
    AND processing_started_at IS NULL
    AND locked_at < NOW() - INTERVAL '30 minutes';
    
  -- Delete any already-failed items (cleanup existing failures)
  DELETE FROM persona_creation_queue
  WHERE status = 'failed';
END;
$function$;

-- Clean up existing failed items immediately
DELETE FROM persona_creation_queue WHERE status = 'failed';