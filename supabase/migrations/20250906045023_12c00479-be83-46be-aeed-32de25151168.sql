-- Add unique constraint for webhook idempotency
CREATE UNIQUE INDEX IF NOT EXISTS ux_billing_transactions_provider_ref
  ON billing_transactions(provider_ref)
  WHERE provider = 'stripe';