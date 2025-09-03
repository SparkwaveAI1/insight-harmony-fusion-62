-- Mark stale 'processing*' items as failed (safe + idempotent)
UPDATE persona_creation_queue
SET status = 'failed',
    error_message = COALESCE(error_message,'') || ' | Auto-fail: stale processing > 20m',
    updated_at = NOW()
WHERE status LIKE 'processing%'
  AND processing_started_at < NOW() - INTERVAL '20 minutes';

-- Reset Heather to pending for clean re-run
UPDATE persona_creation_queue
SET status = 'pending',
    persona_id = NULL,
    error_message = NULL,
    locked_at = NULL,
    processing_started_at = NULL,
    updated_at = NOW()
WHERE name = 'Heather McMillan' 
  AND status = 'processing';