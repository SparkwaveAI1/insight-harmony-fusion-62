-- M1 Hardening: Add missing RLS policies

-- Enable RLS for collection_personas and allow persona owners to see collections that include their personas
ALTER TABLE collection_personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cp_owner_read ON collection_personas;
CREATE POLICY cp_owner_read ON collection_personas
FOR SELECT USING (EXISTS (
  SELECT 1 FROM v4_personas p
  WHERE p.persona_id = collection_personas.persona_id AND p.user_id = auth.uid()
));

-- Update global memories visibility to require authentication
DROP POLICY IF EXISTS global_read_any ON global_memories;
CREATE POLICY global_read_signed_in ON global_memories
FOR SELECT USING (auth.role() = 'authenticated');