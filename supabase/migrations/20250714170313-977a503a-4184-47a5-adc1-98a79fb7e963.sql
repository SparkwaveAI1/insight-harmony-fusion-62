-- Fix the personas RLS policies to properly filter by user ownership
-- The current "Allow public access to personas" policy is too permissive

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public access to personas" ON public.personas;

-- Keep the existing good policies but ensure they work correctly
-- The existing policy "Users can view their own personas or public ones" should handle this correctly