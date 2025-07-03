
-- Phase 1: Critical Database Indexes for Character Lab Performance

-- Drop existing indexes if they exist to recreate them properly
DROP INDEX IF EXISTS idx_characters_creative_performance;
DROP INDEX IF EXISTS idx_characters_creative_public;
DROP INDEX IF EXISTS idx_characters_creative_user;
DROP INDEX IF EXISTS idx_characters_creative_library;

-- Main composite index for the primary Character Lab query pattern
-- This covers: creation_source = 'creative' AND (user_id = X OR is_public = true) ORDER BY created_at DESC
CREATE INDEX idx_characters_creative_performance 
ON characters (creation_source, user_id, is_public, created_at DESC)
WHERE creation_source = 'creative';

-- Specialized index for public creative characters only
CREATE INDEX idx_characters_creative_public 
ON characters (creation_source, is_public, created_at DESC) 
WHERE creation_source = 'creative' AND is_public = true;

-- Index for user's own creative characters
CREATE INDEX idx_characters_creative_user 
ON characters (creation_source, user_id, created_at DESC) 
WHERE creation_source = 'creative';

-- GIN index for JSON search on trait_profile (critical for search functionality)
CREATE INDEX idx_characters_trait_profile_gin 
ON characters USING GIN (trait_profile)
WHERE creation_source = 'creative';

-- Index specifically for name searches (most common search type)
CREATE INDEX idx_characters_creative_name_search 
ON characters (creation_source, name)
WHERE creation_source = 'creative';

-- Composite index for pagination with search
CREATE INDEX idx_characters_creative_search_pagination 
ON characters (creation_source, created_at DESC, character_id)
WHERE creation_source = 'creative';
