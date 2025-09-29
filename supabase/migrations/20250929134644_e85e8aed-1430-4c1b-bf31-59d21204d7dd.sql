-- Update normalize_question function with proper security settings
CREATE OR REPLACE FUNCTION normalize_question(q JSONB) 
RETURNS JSONB 
LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If it's a string, convert to object
  IF jsonb_typeof(q) = 'string' THEN
    RETURN jsonb_build_object('text', q);
  END IF;
  RETURN q;
END;
$$;