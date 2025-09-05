-- SCHEMA: Billing & Credits (Postgres/Supabase)

-- 1) Core reference tables
CREATE TABLE IF NOT EXISTS billing_plans (
  plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,                 -- Free, Starter, Pro, Enterprise
  price_usd NUMERIC NOT NULL DEFAULT 0,
  included_credits INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_price_book (
  price_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,                 -- persona_query, image_gen, video_gen, etc.
  model TEXT,                                -- optional (e.g., gpt-4o, nano-banana)
  credits_cost INT NOT NULL CHECK (credits_cost > 0),
  grace_pct INT NOT NULL DEFAULT 0 CHECK (grace_pct >= 0 AND grace_pct <= 100),
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  effective_to TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2) User billing profile (FK to auth.users)
CREATE TABLE IF NOT EXISTS billing_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES billing_plans(plan_id),
  renewal_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3) Credit ledger (append-only accounting)
CREATE TABLE IF NOT EXISTS billing_credit_ledger (
  ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID,                               -- reserved for teams later
  action_type TEXT,                           -- filled on reservation
  credits_delta INT NOT NULL CHECK (credits_delta <> 0), -- +grant, -use
  source TEXT NOT NULL,                       -- subscription, credit_pack, usage, admin, refund
  action_ref UUID,                            -- links to billing_usage_log.usage_id when settled
  idempotency_key TEXT,                       -- for usage operations
  status TEXT NOT NULL CHECK (status IN ('reserved','settled','reversed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- idempotency cannot repeat for a user
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_ledger_idem
  ON billing_credit_ledger (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_billing_ledger_user_status
  ON billing_credit_ledger (user_id, status);

-- 4) Usage log (what we actually did)
CREATE TABLE IF NOT EXISTS billing_usage_log (
  usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_spent INT NOT NULL CHECK (credits_spent > 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5) Transactions (money in)
CREATE TABLE IF NOT EXISTS billing_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd NUMERIC,
  credits_purchased INT,
  type TEXT NOT NULL,                         -- subscription, credit_pack, admin_adjustment
  provider TEXT,                              -- stripe, coinbase, etc.
  provider_ref TEXT,                          -- invoice/payment intent id
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6) Feature access toggles per plan
CREATE TABLE IF NOT EXISTS billing_feature_access (
  feature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES billing_plans(plan_id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,                  -- video_gen, immersive_worlds, erc6551
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (plan_id, feature_key)
);

-- 7) Live credit balances (view over SETTLED rows)
CREATE OR REPLACE VIEW billing_credit_balances AS
SELECT user_id, COALESCE(SUM(credits_delta),0) AS balance
FROM billing_credit_ledger
WHERE status = 'settled'
GROUP BY user_id;

-- Helper view for AVAILABLE (settled + reserved)
CREATE OR REPLACE VIEW billing_credit_available AS
SELECT user_id, COALESCE(SUM(credits_delta),0) AS available
FROM billing_credit_ledger
WHERE status IN ('settled','reserved')
GROUP BY user_id;

-- Reserve credits (creates a negative 'reserved' row)
CREATE OR REPLACE FUNCTION billing_reserve_credits(
  p_user_id UUID,
  p_action_type TEXT,
  p_required_credits INT,
  p_idempotency_key TEXT DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
) RETURNS TABLE (
  ledger_id UUID,
  available_before INT,
  available_after INT
) LANGUAGE plpgsql AS $$
DECLARE
  v_available INT;
  v_existing RECORD;
BEGIN
  IF p_required_credits <= 0 THEN
    RAISE EXCEPTION 'required_credits must be > 0';
  END IF;

  -- idempotency: if key present, return existing reservation/settlement
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM billing_credit_ledger
    WHERE user_id = p_user_id
      AND idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      -- return state as-is
      SELECT available INTO v_available
      FROM billing_credit_available
      WHERE user_id = p_user_id;

      RETURN QUERY
        SELECT v_existing.ledger_id,
               COALESCE(v_available, 0) AS available_before,
               COALESCE(v_available, 0) AS available_after;
      RETURN;
    END IF;
  END IF;

  SELECT COALESCE( (
    SELECT available FROM billing_credit_available WHERE user_id = p_user_id
  ), 0) INTO v_available;

  IF v_available < p_required_credits THEN
    RAISE EXCEPTION 'insufficient_credits: available=%, required=%', v_available, p_required_credits;
  END IF;

  INSERT INTO billing_credit_ledger (
    user_id, org_id, action_type, credits_delta, source, idempotency_key, status, metadata
  ) VALUES (
    p_user_id, p_org_id, p_action_type, -p_required_credits, 'usage', p_idempotency_key, 'reserved', '{}'
  )
  RETURNING ledger_id INTO ledger_id;

  RETURN QUERY
    SELECT ledger_id,
           v_available AS available_before,
           (v_available - p_required_credits) AS available_after;
END;
$$;

-- Finalize reservation (optionally adjust final cost)
CREATE OR REPLACE FUNCTION billing_finalize_credits(
  p_ledger_id UUID,
  p_credits_final INT DEFAULT NULL,
  p_usage_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE
  v_row billing_credit_ledger%ROWTYPE;
  v_final INT;
  v_usage_id UUID;
BEGIN
  SELECT * INTO v_row FROM billing_credit_ledger
  WHERE ledger_id = p_ledger_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  IF v_row.status <> 'reserved' THEN
    -- safe to be idempotent: if already settled, return existing action_ref
    IF v_row.status = 'settled' THEN
      RETURN v_row.action_ref;
    ELSE
      RAISE EXCEPTION 'cannot_finalize_status=%', v_row.status;
    END IF;
  END IF;

  v_final := COALESCE(p_credits_final, ABS(v_row.credits_delta));
  IF v_final <= 0 THEN
    RAISE EXCEPTION 'final_credits must be > 0';
  END IF;

  -- adjust credits_delta if needed
  IF v_final <> ABS(v_row.credits_delta) THEN
    UPDATE billing_credit_ledger
    SET credits_delta = -v_final
    WHERE ledger_id = p_ledger_id;
  END IF;

  -- write usage log
  INSERT INTO billing_usage_log (user_id, action_type, credits_spent, metadata)
  VALUES (v_row.user_id, COALESCE(v_row.action_type, 'unknown'), v_final, p_usage_metadata)
  RETURNING usage_id INTO v_usage_id;

  -- settle the reservation and link usage
  UPDATE billing_credit_ledger
  SET status = 'settled', action_ref = v_usage_id
  WHERE ledger_id = p_ledger_id;

  RETURN v_usage_id;
END;
$$;

-- Reverse reservation (on failure)
CREATE OR REPLACE FUNCTION billing_reverse_credits(
  p_ledger_id UUID
) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  v_row billing_credit_ledger%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM billing_credit_ledger
  WHERE ledger_id = p_ledger_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  IF v_row.status <> 'reserved' THEN
    -- idempotent: do nothing if already reversed/settled
    RETURN;
  END IF;

  UPDATE billing_credit_ledger
  SET status = 'reversed'
  WHERE ledger_id = p_ledger_id;
END;
$$;

-- Helper: available credits (settled + reserved)
CREATE OR REPLACE FUNCTION billing_available_credits(
  p_user_id UUID
) RETURNS INT
LANGUAGE sql STABLE AS $$
  SELECT COALESCE((
    SELECT available FROM billing_credit_available WHERE user_id = p_user_id
  ), 0);
$$;

-- Plans
INSERT INTO billing_plans (name, price_usd, included_credits) VALUES
  ('Free',    0,  20),
  ('Starter', 10, 120),
  ('Pro',     30, 450)
ON CONFLICT (name) DO NOTHING;

-- Feature flags per plan (seed minimal)
INSERT INTO billing_feature_access (plan_id, feature_key, enabled)
SELECT plan_id, 'image_gen', TRUE FROM billing_plans WHERE name IN ('Free','Starter','Pro')
ON CONFLICT DO NOTHING;

-- Price book v1
INSERT INTO billing_price_book (action_type, model, credits_cost, grace_pct, is_active) VALUES
  ('persona_query', NULL, 1, 10, TRUE),
  ('image_gen',     NULL, 1, 10, TRUE),
  ('image_gen_hi',  NULL, 3,  0, TRUE),
  ('video_gen',     NULL,10,  0, TRUE);