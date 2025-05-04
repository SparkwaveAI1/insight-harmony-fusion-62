
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(table_name TEXT)
RETURNS TABLE(exists BOOLEAN) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql;
