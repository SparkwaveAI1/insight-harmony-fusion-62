-- Delete all persona data and related records
DELETE FROM voicepack_telemetry;
DELETE FROM voicepack_chat_telemetry;
DELETE FROM conversation_messages WHERE persona_id IS NOT NULL OR responding_persona_id IS NOT NULL;
DELETE FROM collection_personas;
DELETE FROM personas_v2;

-- Reset sequences if any
-- Note: UUIDs don't use sequences, but clearing for completeness