-- Add helper function to fix orphaned personas (where persona exists but queue status wasn't updated)
CREATE OR REPLACE FUNCTION public.fix_orphaned_persona_queue_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update queue items that have a valid persona_id but are stuck in processing stages
  UPDATE persona_creation_queue pq
  SET status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
  WHERE pq.status IN ('processing_stage3', 'processing_stage2', 'processing_stage1', 'processing')
    AND pq.persona_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM v4_personas v4 
      WHERE v4.persona_id = pq.persona_id 
      AND v4.creation_completed = true
    );
    
  -- Also check for personas that exist but queue item wasn't updated with persona_id
  UPDATE persona_creation_queue pq
  SET persona_id = v4.persona_id,
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
  FROM v4_personas v4
  WHERE pq.status IN ('processing_stage3', 'processing_stage2', 'processing_stage1', 'processing')
    AND pq.persona_id IS NULL
    AND v4.name = pq.name
    AND v4.user_id = pq.user_id
    AND v4.creation_completed = true
    AND v4.created_at > pq.created_at - INTERVAL '1 hour'; -- Only match recent ones
END;
$function$

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
$function$

-- Run the orphaned persona fix immediately
SELECT fix_orphaned_persona_queue_items();