-- Add unique index to prevent duplicate active alerts
CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_alerts_type_user_active
ON admin_alerts (type, user_id)
WHERE status = 'active';

-- Performance indexes for alerts
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status_created_at
ON admin_alerts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_user_id_created_at
ON admin_alerts (user_id, created_at DESC);

-- Performance indexes for billing tables
CREATE INDEX IF NOT EXISTS idx_billing_usage_log_user_created
ON billing_usage_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_credit_available_user
ON billing_credit_available (user_id);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_renewal_autorenew
ON billing_profiles (auto_renew, renewal_date);