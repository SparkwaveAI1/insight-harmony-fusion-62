-- Create a database function to get users renewing in N days
CREATE OR REPLACE FUNCTION public.get_users_renewing_in_days(days_ahead integer)
RETURNS TABLE(
  id uuid,
  email text,
  renewal_date timestamp with time zone,
  plan_name text,
  price_usd numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bp.user_id as id,
    au.email,
    bp.renewal_date,
    p.name as plan_name,
    p.price_usd
  FROM billing_profiles bp
  JOIN auth.users au ON au.id = bp.user_id
  JOIN billing_plans p ON p.plan_id = bp.plan_id
  WHERE bp.auto_renew = true
    AND bp.renewal_date::date = (now() + interval '1 day' * days_ahead)::date
    AND p.is_active = true;
$$;