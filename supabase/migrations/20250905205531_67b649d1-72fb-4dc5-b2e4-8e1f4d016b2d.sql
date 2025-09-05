-- Fix security issues: Enable RLS and add policies for billing tables

-- Enable RLS on all billing tables
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_price_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_feature_access ENABLE ROW LEVEL SECURITY;

-- Policies for billing_plans (publicly readable, admin only writes)
CREATE POLICY "Anyone can view active billing plans"
  ON billing_plans FOR SELECT
  USING (is_active = true);

-- Policies for billing_price_book (publicly readable for pricing, admin only writes)
CREATE POLICY "Anyone can view active pricing"
  ON billing_price_book FOR SELECT
  USING (is_active = true);

-- Policies for billing_profiles (users can view/manage their own)
CREATE POLICY "Users can view their own billing profile"
  ON billing_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing profile"
  ON billing_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing profile"
  ON billing_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for billing_credit_ledger (users can view their own, system can insert)
CREATE POLICY "Users can view their own credit ledger"
  ON billing_credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit ledger entries"
  ON billing_credit_ledger FOR INSERT
  WITH CHECK (true); -- System operations need broader access

CREATE POLICY "System can update credit ledger entries"
  ON billing_credit_ledger FOR UPDATE
  USING (true); -- System operations need broader access

-- Policies for billing_usage_log (users can view their own, system can insert)
CREATE POLICY "Users can view their own usage log"
  ON billing_usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage log entries"
  ON billing_usage_log FOR INSERT
  WITH CHECK (true); -- System operations need broader access

-- Policies for billing_transactions (users can view their own)
CREATE POLICY "Users can view their own transactions"
  ON billing_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON billing_transactions FOR INSERT
  WITH CHECK (true); -- Payment system needs to insert

-- Policies for billing_feature_access (publicly readable)
CREATE POLICY "Anyone can view feature access rules"
  ON billing_feature_access FOR SELECT
  USING (true);

-- Fix function search paths
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
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION billing_finalize_credits(
  p_ledger_id UUID,
  p_credits_final INT DEFAULT NULL,
  p_usage_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION billing_reverse_credits(
  p_ledger_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION billing_available_credits(
  p_user_id UUID
) RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT available FROM billing_credit_available WHERE user_id = p_user_id
  ), 0);
$$;