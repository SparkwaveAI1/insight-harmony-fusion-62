-- Fix security warnings by setting search_path on functions
-- This prevents function search path vulnerabilities

-- Update the participant identifier generation function
CREATE OR REPLACE FUNCTION generate_participant_identifier()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;

-- Update the participant identifier trigger function
CREATE OR REPLACE FUNCTION set_participant_identifier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.unique_identifier IS NULL THEN
    NEW.unique_identifier := generate_participant_identifier();
  END IF;
  RETURN NEW;
END;
$$;