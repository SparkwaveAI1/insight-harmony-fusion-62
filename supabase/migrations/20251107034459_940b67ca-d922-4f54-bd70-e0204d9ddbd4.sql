-- Fix admin_alerts RLS to use role-based access instead of hardcoded emails
DROP POLICY IF EXISTS "Admins can manage all alerts" ON public.admin_alerts;

CREATE POLICY "Admins can manage all alerts"
ON public.admin_alerts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));