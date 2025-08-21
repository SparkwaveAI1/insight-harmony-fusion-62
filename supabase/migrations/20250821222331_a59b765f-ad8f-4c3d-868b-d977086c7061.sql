-- Create V4 Personas table (simple version for now)
CREATE TABLE v4_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id text UNIQUE NOT NULL,
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  schema_version text DEFAULT 'v4.0' NOT NULL,
  
  -- Full detailed profile (will be populated in Call 1)
  full_profile jsonb NOT NULL DEFAULT '{}',
  
  -- Conversation summary (will be populated in Call 2)  
  conversation_summary jsonb NOT NULL DEFAULT '{}',
  
  -- Creation tracking
  creation_stage text DEFAULT 'not_started' CHECK (creation_stage IN ('not_started', 'detailed_traits', 'summary_generation', 'completed')),
  creation_completed boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE v4_personas ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can only access their own v4_personas" ON v4_personas
  FOR ALL USING (auth.uid() = user_id);

-- Add update trigger for updated_at
CREATE TRIGGER update_v4_personas_updated_at
  BEFORE UPDATE ON v4_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();