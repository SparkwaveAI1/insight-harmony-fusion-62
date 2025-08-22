-- Drop and recreate the UPDATE policy with proper WITH CHECK clause
DROP POLICY "Users can update their own v4_personas" ON v4_personas;

CREATE POLICY "Users can update their own v4_personas" 
ON v4_personas 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);