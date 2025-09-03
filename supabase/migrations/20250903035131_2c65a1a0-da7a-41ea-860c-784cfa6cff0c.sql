-- Add new columns to persona_creation_queue for atomic processing and tracking
ALTER TABLE persona_creation_queue
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

-- Add index for performance on status and attempt_count
CREATE INDEX IF NOT EXISTS idx_pcq_status_attempts 
  ON persona_creation_queue (status, attempt_count);

-- Create atomic queue popping function
CREATE OR REPLACE FUNCTION pop_next_persona_queue()
RETURNS persona_creation_queue
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec persona_creation_queue;
BEGIN
  -- Atomically select and lock the next pending item
  SELECT *
  INTO rec
  FROM persona_creation_queue
  WHERE status = 'pending' 
    AND attempt_count < 3  -- Cap retries
  ORDER BY created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  -- If no pending items, return null
  IF rec.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Update the item to processing status
  UPDATE persona_creation_queue
  SET status = 'processing',
      locked_at = NOW(),
      processing_started_at = NOW(),
      attempt_count = COALESCE(attempt_count, 0) + 1,
      updated_at = NOW()
  WHERE id = rec.id;

  -- Return the updated record
  SELECT * INTO rec FROM persona_creation_queue WHERE id = rec.id;
  RETURN rec;
END;
$$;