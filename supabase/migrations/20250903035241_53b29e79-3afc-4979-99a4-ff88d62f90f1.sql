-- Fix security warning: Set search_path for the function
CREATE OR REPLACE FUNCTION pop_next_persona_queue()
RETURNS persona_creation_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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