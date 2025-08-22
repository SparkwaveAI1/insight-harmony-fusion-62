-- Fix security warnings: Set proper search_path for functions

-- Drop and recreate has_role function with proper search_path
DROP FUNCTION public.has_role(_user_id UUID, _role app_role);

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

-- Drop and recreate is_researcher_or_admin function with proper search_path
DROP FUNCTION public.is_researcher_or_admin(_user_id UUID);

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