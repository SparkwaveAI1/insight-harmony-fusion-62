-- Add RLS policy allowing admins to view all personas
CREATE POLICY "Admins can view all personas" 
ON public.v4_personas 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));