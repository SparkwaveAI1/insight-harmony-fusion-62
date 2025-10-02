-- Reverse stuck credit reservations (without updated_at column)
UPDATE billing_credit_ledger
SET status = 'reversed'
WHERE status = 'reserved'
  AND action_type = 'insights_survey'
  AND created_at < NOW() - INTERVAL '1 hour';

-- Update stuck survey sessions to completed
UPDATE research_survey_sessions
SET status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
WHERE status = 'active'
  AND created_at < NOW() - INTERVAL '1 hour';