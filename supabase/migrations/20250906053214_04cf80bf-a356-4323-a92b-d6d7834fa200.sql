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

-- Schedule the renewal reminder function to run daily at 14:00 UTC
SELECT cron.schedule(
  'renewal-reminder-daily',
  '0 14 * * *', -- Daily at 14:00 UTC (2 PM)
  $$
  SELECT
    net.http_post(
        url:='https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/renewal-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);