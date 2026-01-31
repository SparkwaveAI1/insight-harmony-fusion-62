-- Rate limit tracking table for edge functions
-- Uses sliding window approach with automatic cleanup

CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_key TEXT NOT NULL,                    -- format: "function_name:user_id"
    user_id TEXT,                              -- for analytics/debugging
    function_name TEXT NOT NULL,               -- which function was called
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient window queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_key_time 
    ON rate_limit_log(rate_key, created_at DESC);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_created 
    ON rate_limit_log(created_at);

-- Automatically clean up old entries (older than 5 minutes)
-- Run this periodically via cron or pg_cron
CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limit_log 
    WHERE created_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Comment for documentation
COMMENT ON TABLE rate_limit_log IS 'Tracks API request counts for rate limiting edge functions';
