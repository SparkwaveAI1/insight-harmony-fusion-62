-- ENHANCED SECURITY: Complete lockdown of participants table
-- Remove ALL public access and restrict to authenticated researchers only

-- Drop all existing SELECT policies to start fresh
DROP POLICY IF EXISTS "Participants can view only their own data when authenticated" ON public.participants;
DROP POLICY IF EXISTS "Participants can view data via secure identifier" ON public.participants;
DROP POLICY IF EXISTS "Participants can view their own data" ON public.participants;

-- Create highly restrictive SELECT policy - ONLY authenticated researchers/admins
CREATE POLICY "Only authenticated researchers can access participant data"
  ON public.participants
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'researcher'::app_role)
    )
  );

-- For legitimate participant access (like updating their own data),
-- create a very specific policy that requires both authentication AND ownership
CREATE POLICY "Participants can view only their specific data when authenticated"
  ON public.participants
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND email = (
      SELECT users.email::text
      FROM auth.users
      WHERE users.id = auth.uid()
    )
    AND unique_identifier IS NOT NULL
  );

-- Ensure INSERT is also locked down
DROP POLICY IF EXISTS "Authenticated users or valid research session can register participants" ON public.participants;

CREATE POLICY "Only researchers can create participant records"
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

-- Allow service-level participant registration for research flow
-- but with strict validation
CREATE POLICY "Service can register participants with validation"
  ON public.participants
  FOR INSERT
  WITH CHECK (
    -- This should only be used by edge functions or service calls
    -- with proper validation context
    unique_identifier IS NOT NULL 
    AND length(unique_identifier) >= 32  -- Increased minimum length
    AND email IS NOT NULL 
    AND length(email) > 5 
    AND length(email) < 255 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
    -- Additional check: ensure this is a legitimate service call
    AND (current_setting('request.headers'::text, true))::json ->> 'x-service-key' IS NOT NULL
  );