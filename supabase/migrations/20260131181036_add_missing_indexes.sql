-- Migration: Add missing indexes for performance
-- Date: 2026-01-31
-- Issue: Slow queries on conversation_messages and billing_credit_ledger

-- Index for faster message loading in conversations
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv_created 
ON conversation_messages (conversation_id, created_at DESC);

-- Index for faster credit balance queries
CREATE INDEX IF NOT EXISTS idx_billing_credit_ledger_user_created 
ON billing_credit_ledger (user_id, created_at DESC);

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Missing indexes added successfully.';
END $$;
