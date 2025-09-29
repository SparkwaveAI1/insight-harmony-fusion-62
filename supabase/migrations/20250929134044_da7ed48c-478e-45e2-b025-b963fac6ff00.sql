-- Create helper function to normalize questions for backward compatibility
CREATE OR REPLACE FUNCTION normalize_question(q JSONB) 
RETURNS JSONB AS $$
BEGIN
  -- If it's a string, convert to object
  IF jsonb_typeof(q) = 'string' THEN
    RETURN jsonb_build_object('text', q);
  END IF;
  RETURN q;
END;
$$ LANGUAGE plpgsql IMMUTABLE;