-- Add function to check queue health and return status
CREATE OR REPLACE FUNCTION public.get_queue_health_status()
RETURNS TABLE(
  total_pending integer,
  total_processing integer,
  total_stuck integer,
  oldest_stuck_item text,
  processing_time_minutes integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    (SELECT COUNT(*)::integer FROM persona_creation_queue WHERE status = 'pending'),
    (SELECT COUNT(*)::integer FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3')),
    (SELECT COUNT(*)::integer FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3') AND processing_started_at < NOW() - INTERVAL '10 minutes'),
    (SELECT name FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3') AND processing_started_at < NOW() - INTERVAL '10 minutes' ORDER BY processing_started_at ASC LIMIT 1),
    (SELECT EXTRACT(EPOCH FROM (NOW() - MIN(processing_started_at))) / 60 FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3'))::integer;
$function$;