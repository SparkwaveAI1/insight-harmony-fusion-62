-- FINAL SECURITY LOCKDOWN: Ensure NO public access to participants table
-- This should completely eliminate the security vulnerability

-- Verify RLS is enabled (it should be already)
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Only authenticated researchers can access participant data" ON public.participants;
DROP POLICY IF EXISTS "Participants can view only their specific data when authenticated" ON public.participants;
DROP POLICY IF EXISTS "Only researchers can create participant records" ON public.participants;
DROP POLICY IF EXISTS "Service can register participants with validation" ON public.participants;
DROP POLICY IF EXISTS "Participants can update their own data" ON public.participants;
DROP POLICY IF EXISTS "Participants can update via identifier" ON public.participants;

-- Create the most restrictive policies possible

-- SELECT: Only admins and researchers can read ANY participant data
CREATE POLICY "Admin and researcher read access only"
  ON public.participants
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'researcher'::app_role)
    )
  );

-- INSERT: Only admins and researchers can create participant records
CREATE POLICY "Admin and researcher insert access only"
  ON public.participants
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'researcher'::app_role)
    )
    AND email IS NOT NULL 
    AND length(email) > 5 
    AND length(email) < 255 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
  );

-- UPDATE: Only admins can update participant data
CREATE POLICY "Admin update access only"
  ON public.participants
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- DELETE: Only admins can delete participant data  
CREATE POLICY "Admin delete access only"
  ON public.participants
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Remove any potential public access through grants
REVOKE ALL ON public.participants FROM PUBLIC;
REVOKE ALL ON public.participants FROM anon;
REVOKE ALL ON public.participants FROM authenticated;

-- Grant specific access only to service role for legitimate operations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO service_role;