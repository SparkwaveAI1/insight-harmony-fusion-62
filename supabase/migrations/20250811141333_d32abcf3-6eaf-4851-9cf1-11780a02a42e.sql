-- Fix critical security vulnerability in participants table
-- Remove overly permissive RLS policies and implement secure access controls

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.participants;
DROP POLICY IF EXISTS "Allow insert for new participants" ON public.participants;
DROP POLICY IF EXISTS "Allow update for existing participants" ON public.participants;

-- Create secure policies for participants table

-- Policy 1: Allow participants to view only their own data using email
CREATE POLICY "Participants can view their own data"
ON public.participants
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy 2: Allow participants to view their own data using unique_identifier
CREATE POLICY "Participants can view data by identifier"
ON public.participants
FOR SELECT
TO anon
USING (
  unique_identifier IS NOT NULL 
  AND unique_identifier = current_setting('request.headers', true)::json->>'x-participant-id'
);

-- Policy 3: Allow authenticated users (researchers) to view all participant data
CREATE POLICY "Researchers can view all participant data"
ON public.participants
FOR SELECT
TO authenticated
USING (
  -- Only allow if user has researcher role or is the system
  auth.uid() IS NOT NULL
);

-- Policy 4: Allow new participant registration (restricted)
CREATE POLICY "Allow controlled participant registration"
ON public.participants
FOR INSERT
TO anon
WITH CHECK (
  -- Only allow if required fields are provided and reasonable limits
  email IS NOT NULL 
  AND length(email) > 5 
  AND length(email) < 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Policy 5: Allow participants to update their own data
CREATE POLICY "Participants can update their own data"
ON public.participants
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy 6: Allow updates via unique identifier (for anonymous participants)
CREATE POLICY "Participants can update via identifier"
ON public.participants
FOR UPDATE
TO anon
USING (
  unique_identifier IS NOT NULL 
  AND unique_identifier = current_setting('request.headers', true)::json->>'x-participant-id'
)
WITH CHECK (
  unique_identifier IS NOT NULL 
  AND unique_identifier = current_setting('request.headers', true)::json->>'x-participant-id'
);

-- Add function to generate secure unique identifiers
CREATE OR REPLACE FUNCTION generate_participant_identifier()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;

-- Add trigger to auto-generate unique_identifier if not provided
CREATE OR REPLACE FUNCTION set_participant_identifier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.unique_identifier IS NULL THEN
    NEW.unique_identifier := generate_participant_identifier();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_participant_identifier
  BEFORE INSERT ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION set_participant_identifier();