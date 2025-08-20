-- First, drop the policy that depends on personas_v2
DROP POLICY IF EXISTS "Users can view their own voicepack telemetry" ON public.voicepack_telemetry;

-- Create a new policy that references the personas table instead
CREATE POLICY "Users can view their own voicepack telemetry" 
ON public.voicepack_telemetry 
FOR SELECT 
USING (persona_id IN ( 
  SELECT personas.persona_id
  FROM personas
  WHERE (personas.user_id = auth.uid())
));

-- Now drop the personas_v2 table
DROP TABLE IF EXISTS public.personas_v2;