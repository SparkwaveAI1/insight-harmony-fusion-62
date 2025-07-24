-- Fix database function security by adding proper search_path settings
-- This prevents search path injection attacks

-- Update existing functions to be security definer with proper search path
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_non_humanoid_character_current_image()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If this is being set as current, unset any other current images for this character
  IF NEW.is_current = true THEN
    UPDATE public.non_humanoid_character_images
    SET is_current = false
    WHERE character_id = NEW.character_id
    AND id != NEW.id
    AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_persona_current_image()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If this is being set as current, unset any other current images for this persona
  IF NEW.is_current = true THEN
    UPDATE public.persona_images
    SET is_current = false
    WHERE persona_id = NEW.persona_id
    AND id != NEW.id
    AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_character_current_image()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If this is being set as current, unset any other current images for this character
  IF NEW.is_current = true THEN
    UPDATE public.character_images
    SET is_current = false
    WHERE character_id = NEW.character_id
    AND id != NEW.id
    AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix persona table policies to be more restrictive
-- Remove overly permissive policies and create more secure ones
DROP POLICY IF EXISTS "Allow inserting personas" ON public.personas;
DROP POLICY IF EXISTS "Allow reading all personas" ON public.personas;

-- Create more secure policies
CREATE POLICY "Allow authenticated users to create personas" 
ON public.personas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to view public personas and their own" 
ON public.personas 
FOR SELECT 
USING (is_public = true OR (auth.uid() = user_id AND auth.uid() IS NOT NULL));

-- Add function to get current user ID securely
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid();
$$;