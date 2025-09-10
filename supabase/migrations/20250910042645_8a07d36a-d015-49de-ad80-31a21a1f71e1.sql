-- Improve the fail_stale_persona_jobs function to handle edge cases better
CREATE OR REPLACE FUNCTION public.fail_stale_persona_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update stale processing jobs (older than 20 minutes)
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | Auto-fail: stale processing > 20m',
      updated_at = NOW()
  WHERE status LIKE 'processing%'
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
$function$;

-- Create a function to automatically run cleanup on queue operations
CREATE OR REPLACE FUNCTION public.auto_cleanup_stale_queue_jobs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Run cleanup when queue is accessed (but not too frequently)
  -- Use a simple check to avoid running this too often
  IF random() < 0.1 THEN -- 10% chance to run cleanup
    PERFORM fail_stale_persona_jobs();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger to auto-cleanup on queue updates
DROP TRIGGER IF EXISTS trigger_auto_cleanup_queue ON persona_creation_queue;
CREATE TRIGGER trigger_auto_cleanup_queue
  AFTER UPDATE ON persona_creation_queue
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_cleanup_stale_queue_jobs();