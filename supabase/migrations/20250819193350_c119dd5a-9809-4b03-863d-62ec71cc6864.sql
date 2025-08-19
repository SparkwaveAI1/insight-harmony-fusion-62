-- Add performance indices for voicepack system
CREATE INDEX IF NOT EXISTS idx_personas_v2_voicepack_hash ON personas_v2(voicepack_hash);
CREATE INDEX IF NOT EXISTS idx_personas_v2_persona_id ON personas_v2(persona_id);
CREATE INDEX IF NOT EXISTS idx_personas_v2_user_id_public ON personas_v2(user_id, is_public);

-- Add GIN indices for JSONB columns used in voicepack compilation
CREATE INDEX IF NOT EXISTS idx_personas_v2_persona_data_gin ON personas_v2 USING GIN(persona_data);
CREATE INDEX IF NOT EXISTS idx_personas_v2_voicepack_runtime_gin ON personas_v2 USING GIN(voicepack_runtime);

-- Add indices for telemetry tables
CREATE INDEX IF NOT EXISTS idx_voicepack_telemetry_persona_id ON voicepack_telemetry(persona_id);
CREATE INDEX IF NOT EXISTS idx_voicepack_telemetry_created_at ON voicepack_telemetry(created_at);
CREATE INDEX IF NOT EXISTS idx_voicepack_chat_telemetry_persona_id ON voicepack_chat_telemetry(persona_id);
CREATE INDEX IF NOT EXISTS idx_voicepack_chat_telemetry_user_id ON voicepack_chat_telemetry(user_id);