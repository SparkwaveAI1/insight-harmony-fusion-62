-- Update fail_stale_persona_jobs to handle all processing stages
CREATE OR REPLACE FUNCTION public.fail_stale_persona_jobs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update stale processing jobs (older than 20 minutes) - handle all processing stages
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | Auto-fail: stale processing > 20m',
      updated_at = NOW()
  WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3')
    AND processing_started_at < NOW() - INTERVAL '20 minutes';
    
  -- Also fail jobs that have been locked but never started processing (edge case)
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | Auto-fail: locked without processing > 30m',
      updated_at = NOW()
  WHERE status = 'processing'
    AND locked_at IS NOT NULL
    AND processing_started_at IS NULL
    AND locked_at < NOW() - INTERVAL '30 minutes';
    
  -- Reset jobs that have been pending for too long (potential edge case)
  UPDATE persona_creation_queue
  SET attempt_count = 0,
      locked_at = NULL,
      processing_started_at = NULL,
      updated_at = NOW()
  WHERE status = 'pending'
    AND attempt_count >= 3
    AND updated_at < NOW() - INTERVAL '1 hour';
END;
$function$