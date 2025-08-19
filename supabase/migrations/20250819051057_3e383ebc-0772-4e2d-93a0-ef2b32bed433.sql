-- Add voicepack columns to personas_v2 table
ALTER TABLE public.personas_v2 
ADD COLUMN IF NOT EXISTS voicepack_runtime JSONB,
ADD COLUMN IF NOT EXISTS voicepack_hash TEXT;

-- Create index on voicepack_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_personas_v2_voicepack_hash 
ON public.personas_v2 (voicepack_hash);

-- Create a table for voicepack telemetry
CREATE TABLE IF NOT EXISTS public.voicepack_telemetry (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    persona_id TEXT NOT NULL,
    session_id TEXT,
    voicepack_hash TEXT NOT NULL,
    used_response_shape TEXT NOT NULL,
    signature_token_count INTEGER DEFAULT 0,
    banned_frame_hits INTEGER DEFAULT 0,
    must_include_satisfied BOOLEAN DEFAULT false,
    rhetorical_q_count INTEGER DEFAULT 0,
    avg_sentence_length DECIMAL(4,2),
    latency_ms INTEGER,
    turn_classification JSONB,
    state_deltas_applied JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on voicepack_telemetry
ALTER TABLE public.voicepack_telemetry ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own telemetry
CREATE POLICY "Users can view their own voicepack telemetry" 
ON public.voicepack_telemetry 
FOR SELECT 
USING (
    persona_id IN (
        SELECT persona_id 
        FROM public.personas_v2 
        WHERE user_id = auth.uid()
    )
);

-- Create policy for inserting telemetry (allow service role)
CREATE POLICY "Service can insert voicepack telemetry" 
ON public.voicepack_telemetry 
FOR INSERT 
WITH CHECK (true);

-- Create index on persona_id for telemetry queries
CREATE INDEX IF NOT EXISTS idx_voicepack_telemetry_persona_id 
ON public.voicepack_telemetry (persona_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_voicepack_telemetry_created_at 
ON public.voicepack_telemetry (created_at DESC);