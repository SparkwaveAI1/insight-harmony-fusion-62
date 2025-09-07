-- Add performance indexes for frequent queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_usage_log_user_created 
ON billing_usage_log(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_transactions_user_created 
ON billing_transactions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_alerts_status_severity_created 
ON admin_alerts(status, severity, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_credit_ledger_user_created 
ON billing_credit_ledger(user_id, created_at DESC);