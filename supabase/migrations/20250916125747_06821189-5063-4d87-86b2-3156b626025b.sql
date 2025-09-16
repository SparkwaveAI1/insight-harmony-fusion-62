-- Create a simple function to manually clear specific queue items
CREATE OR REPLACE FUNCTION public.manual_clear_queue_item(item_id UUID, clear_reason TEXT DEFAULT 'Manually cleared')
RETURNS persona_creation_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result persona_creation_queue;
BEGIN
  UPDATE persona_creation_queue
  SET status = 'failed',
      error_message = COALESCE(error_message, '') || ' | ' || clear_reason,
      updated_at = NOW()
  WHERE id = item_id
  RETURNING * INTO result;
  
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Queue item with id % not found', item_id;
  END IF;
  
  RETURN result;
END;
$function$;