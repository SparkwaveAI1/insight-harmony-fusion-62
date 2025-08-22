-- Add UPDATE policy for v4_personas to allow users to update their own personas
CREATE POLICY "Users can update their own v4_personas" 
ON v4_personas 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);