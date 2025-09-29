-- Path 2: Hybrid Quick-Fix for Security Definer Views

-- 1. Fix billing_credit_available with security_invoker
DROP VIEW IF EXISTS billing_credit_available;

CREATE VIEW billing_credit_available 
WITH (security_invoker=true) AS
SELECT 
  user_id,
  COALESCE(SUM(credits_delta), 0)::bigint AS available
FROM billing_credit_ledger
WHERE status IN ('settled', 'reserved')
GROUP BY user_id;

-- Grant access to authenticated users
GRANT SELECT ON billing_credit_available TO authenticated;

-- 2. Leave billing_credit_balances as-is (security definer for admin use)
-- No changes needed

-- 3. Drop personas_union (unused view)
DROP VIEW IF EXISTS personas_union;