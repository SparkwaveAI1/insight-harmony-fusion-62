-- Clean up Voicepack remnants from database

-- Drop the voicepack telemetry tables (they're empty and unused)
DROP TABLE IF EXISTS public.voicepack_telemetry CASCADE;
DROP TABLE IF EXISTS public.voicepack_chat_telemetry CASCADE;

-- Remove any orphaned policies (cascaded drops should handle this, but being explicit)
-- No additional cleanup needed as CASCADE handles dependent objects