-- Reset stuck queue item back to pending status
-- This fixes the issue where "Process Queue" shows "Queue empty" 
-- because the Brian O'Leary item is stuck at processing_stage2

UPDATE persona_creation_queue 
SET 
  status = 'pending',
  processing_started_at = NULL,
  locked_at = NULL,
  updated_at = NOW()
WHERE id = 'c4650c60-53ed-40fa-93a7-760f271f089d'
  AND status = 'processing_stage2'
  AND name = 'Brian O''Leary';

-- Also run the existing cleanup function to handle any other stale jobs
SELECT fail_stale_persona_jobs();