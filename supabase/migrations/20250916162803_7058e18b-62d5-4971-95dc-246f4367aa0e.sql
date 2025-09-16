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
$function$;