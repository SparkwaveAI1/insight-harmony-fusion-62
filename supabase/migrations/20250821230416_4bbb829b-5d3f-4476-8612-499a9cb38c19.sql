-- Fix RLS policy for v4_personas table
-- The issue is likely that the policy is checking auth.uid() = user_id 
-- but the edge function might not be passing the user context properly

-- First, let's check the current policy and recreate it properly
DROP POLICY IF EXISTS "Users can only access their own v4_personas" ON v4_personas;

-- Create proper RLS policies for v4_personas
CREATE POLICY "Users can view their own v4_personas" 
ON v4_personas FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own v4_personas" 
ON v4_personas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own v4_personas" 
ON v4_personas FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own v4_personas" 
ON v4_personas FOR DELETE 
USING (auth.uid() = user_id);