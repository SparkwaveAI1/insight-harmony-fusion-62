-- Fix security warnings by recreating functions with proper search_path
-- Drop functions with CASCADE to remove dependent policies
DROP FUNCTION public.has_role(_user_id UUID, _role app_role) CASCADE;
DROP FUNCTION public.is_researcher_or_admin(_user_id UUID) CASCADE;

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_researcher_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('researcher', 'admin')
  )
$$;

-- Recreate the dropped policies
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view access logs"
ON public.participant_access_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));