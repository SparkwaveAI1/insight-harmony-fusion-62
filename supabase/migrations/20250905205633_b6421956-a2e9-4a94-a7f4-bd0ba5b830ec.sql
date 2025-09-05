-- Fix security definer view issues by recreating views as security invoker

-- Drop existing views
DROP VIEW IF EXISTS billing_credit_balances;
DROP VIEW IF EXISTS billing_credit_available;

-- Recreate views as security invoker (default behavior)
CREATE VIEW billing_credit_balances AS
SELECT user_id, COALESCE(SUM(credits_delta),0) AS balance
FROM billing_credit_ledger
WHERE status = 'settled'
GROUP BY user_id;

CREATE VIEW billing_credit_available AS
SELECT user_id, COALESCE(SUM(credits_delta),0) AS available
FROM billing_credit_ledger
WHERE status IN ('settled','reserved')
GROUP BY user_id;