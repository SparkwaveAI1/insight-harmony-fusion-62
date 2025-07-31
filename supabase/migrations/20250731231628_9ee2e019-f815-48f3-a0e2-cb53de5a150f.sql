-- Fix RLS policies for collections table
-- Drop the duplicate/conflicting policies
DROP POLICY IF EXISTS "Users can view their own collections or public ones" ON public.collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;

-- Create a single, correct SELECT policy
CREATE POLICY "Users can view their own collections or public ones" 
ON public.collections 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);