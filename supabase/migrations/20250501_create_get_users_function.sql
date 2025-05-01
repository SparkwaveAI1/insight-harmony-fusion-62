
-- This function will retrieve user information
-- Note: This requires permissions to access auth.users
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only users with sufficient privileges should be able to call this
  -- In a production environment, you'd want to add role-based checks here
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    au.last_sign_in_at
  FROM 
    auth.users au
  ORDER BY 
    au.created_at DESC;
END;
$$;

-- Only allow authenticated users to execute this function
REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
