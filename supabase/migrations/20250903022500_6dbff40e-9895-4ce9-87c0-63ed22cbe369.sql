UPDATE persona_creation_queue 
SET status = 'failed', error_message = 'Manual stop - debugging loop issue'
WHERE status IN ('processing', 'processing_stage2', 'processing_stage3')
AND name = 'Nathan Redbird';