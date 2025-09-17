-- Remove the conversation_summary column from v4_personas table
ALTER TABLE v4_personas DROP COLUMN IF EXISTS conversation_summary;