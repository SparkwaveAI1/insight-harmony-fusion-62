-- Create persona-voicepack-chat edge function to handle voicepack-driven conversations
-- This will be created as a separate edge function to maintain the existing persona-quick-chat functionality

-- First, create a table to store voicepack chat telemetry
CREATE TABLE IF NOT EXISTS public.voicepack_chat_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id TEXT NOT NULL,
  conversation_id UUID,
  user_id UUID NOT NULL,
  voicepack_hash TEXT,
  response_shape TEXT,
  signature_token_count INTEGER DEFAULT 0,
  banned_frame_hits INTEGER DEFAULT 0,
  must_include_satisfied BOOLEAN DEFAULT false,
  rhetorical_q_count INTEGER DEFAULT 0,
  avg_sentence_length NUMERIC,
  estimated_tokens INTEGER,
  latency_ms INTEGER,
  classification JSONB,
  plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voicepack_chat_telemetry ENABLE ROW LEVEL SECURITY;

-- Create policies for telemetry
CREATE POLICY "Users can view their own voicepack chat telemetry" 
ON public.voicepack_chat_telemetry 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voicepack chat telemetry" 
ON public.voicepack_chat_telemetry 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_voicepack_telemetry_user_persona ON public.voicepack_chat_telemetry(user_id, persona_id);
CREATE INDEX idx_voicepack_telemetry_conversation ON public.voicepack_chat_telemetry(conversation_id);
CREATE INDEX idx_voicepack_telemetry_created_at ON public.voicepack_chat_telemetry(created_at DESC);