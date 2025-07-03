
-- Critical indexes for Character Lab performance optimization
-- These will dramatically improve query performance for the main Character Lab queries

-- Main composite index for the primary Character Lab query pattern
-- This covers: creation_source = 'creative' AND (user_id = X OR is_public = true) ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_creative_performance 
ON characters (creation_source, user_id, is_public, created_at DESC);

-- Specialized index for public creative characters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_creative_public 
ON characters (creation_source, is_public, created_at DESC) 
WHERE creation_source = 'creative' AND is_public = true;

-- Index for user's own creative characters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_creative_user 
ON characters (creation_source, user_id, created_at DESC) 
WHERE creation_source = 'creative';

-- Index to support the main library query more efficiently
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_characters_creative_library 
ON characters (creation_source, created_at DESC) 
WHERE creation_source = 'creative';
