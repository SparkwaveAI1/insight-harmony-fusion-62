-- Mark David Kim's stuck queue item as completed
UPDATE persona_creation_queue 
SET status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
WHERE name = 'David Kim' 
  AND status = 'processing' 
  AND persona_id IS NOT NULL;