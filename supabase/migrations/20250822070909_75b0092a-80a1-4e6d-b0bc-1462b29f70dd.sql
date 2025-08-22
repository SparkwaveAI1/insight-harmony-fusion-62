-- Create user roles system for proper access control
CREATE TYPE public.app_role AS ENUM ('admin', 'researcher', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is researcher or admin
CREATE OR REPLACE FUNCTION public.is_researcher_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('researcher', 'admin')
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Remove the dangerous policy that allows any authenticated user to see all participant data
DROP POLICY "Researchers can view all participant data" ON participants;

-- Create secure policy for researchers and admins only
CREATE POLICY "Authorized researchers can view participant data"
ON participants
FOR SELECT
USING (public.is_researcher_or_admin(auth.uid()));

-- Create audit log table for participant data access
CREATE TABLE public.participant_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    participant_id UUID REFERENCES participants(id) NOT NULL,
    access_type TEXT NOT NULL, -- 'view', 'update', 'export', etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_email TEXT,
    ip_address INET
);

-- Enable RLS on access log
ALTER TABLE public.participant_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admins can view access logs"
ON public.participant_access_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Service can insert access logs
CREATE POLICY "Service can insert access logs"
ON public.participant_access_log
FOR INSERT
WITH CHECK (true);