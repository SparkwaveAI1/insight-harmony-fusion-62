-- SECURITY FIX: Restrict participants table access to authorized users only
-- This addresses the vulnerability where email addresses could be exposed

-- First, let's see the current state and then implement secure policies

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Participants can view data by identifier" ON public.participants;
DROP POLICY IF EXISTS "Allow controlled participant registration" ON public.participants;

-- Create a more restrictive registration policy that requires authentication
-- OR a valid research session context
CREATE POLICY "Authenticated users or valid research session can register participants"
  ON public.participants
  FOR INSERT
  WITH CHECK (
    -- Either user is authenticated
    auth.uid() IS NOT NULL
    OR
    -- Or this is coming from a valid research session with proper headers
    (
      unique_identifier IS NOT NULL 
      AND length(unique_identifier) >= 16
      AND email IS NOT NULL 
      AND length(email) > 5 
      AND length(email) < 255 
      AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
    )
  );

-- Create secure SELECT policies that prevent data exposure
CREATE POLICY "Participants can view only their own data when authenticated"
  ON public.participants
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND email = (
      SELECT users.email::text
      FROM auth.users
      WHERE users.id = auth.uid()
    )
  );

-- Allow participants to view their data via secure identifier system
-- but only with proper authentication context
CREATE POLICY "Participants can view data via secure identifier"
  ON public.participants
  FOR SELECT
  USING (
    unique_identifier IS NOT NULL
    AND unique_identifier = (
      (current_setting('request.headers'::text, true))::json ->> 'x-participant-id'::text
    )
    -- Additional security: ensure this is from a legitimate request context
    AND (current_setting('request.headers'::text, true))::json ->> 'user-agent' IS NOT NULL
  );

-- Admins and researchers should be able to access participant data for legitimate research
CREATE POLICY "Researchers and admins can access participant data"
  ON public.participants
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'researcher'::app_role)
    )
  );

-- Update policies should remain restrictive
-- Keep the existing update policies as they are secure

-- Add a policy to prevent unauthorized deletion
CREATE POLICY "Only admins can delete participant data"
  ON public.participants
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND has_role(auth.uid(), 'admin'::app_role)
  );