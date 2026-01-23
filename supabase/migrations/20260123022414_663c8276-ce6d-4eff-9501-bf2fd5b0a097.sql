-- Add authorization checks to billing functions

-- billing_reserve_credits: Add auth check at start
CREATE OR REPLACE FUNCTION public.billing_reserve_credits(
  p_user_id uuid,
  p_action_type text,
  p_required_credits integer,
  p_idempotency_key text DEFAULT NULL::text,
  p_org_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(ledger_id uuid, available_before integer, available_after integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_available INT;
  v_existing RECORD;
  v_ledger_id UUID;
BEGIN
  -- Authorization: require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  
  -- Authorization: caller must be acting on their own behalf or be an admin
  IF auth.uid() <> p_user_id THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'unauthorized: cannot modify other users credits';
    END IF;
  END IF;

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
  RETURNING billing_credit_ledger.ledger_id INTO v_ledger_id;

  RETURN QUERY
    SELECT v_ledger_id,
           v_available AS available_before,
           (v_available - p_required_credits) AS available_after;
END;
$function$;

-- billing_finalize_credits: Add auth check
CREATE OR REPLACE FUNCTION public.billing_finalize_credits(
  p_ledger_id uuid,
  p_credits_final integer DEFAULT NULL::integer,
  p_usage_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row billing_credit_ledger%ROWTYPE;
  v_final INT;
  v_usage_id UUID;
BEGIN
  -- Authorization: require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT * INTO v_row FROM billing_credit_ledger
  WHERE ledger_id = p_ledger_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  -- Authorization: caller must own the ledger entry or be an admin
  IF auth.uid() <> v_row.user_id THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'unauthorized: cannot finalize other users credits';
    END IF;
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
$function$;

-- billing_reverse_credits: Add auth check
CREATE OR REPLACE FUNCTION public.billing_reverse_credits(
  p_ledger_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row billing_credit_ledger%ROWTYPE;
BEGIN
  -- Authorization: require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT * INTO v_row FROM billing_credit_ledger
  WHERE ledger_id = p_ledger_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  -- Authorization: caller must own the ledger entry or be an admin
  IF auth.uid() <> v_row.user_id THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'unauthorized: cannot reverse other users credits';
    END IF;
  END IF;

  IF v_row.status <> 'reserved' THEN
    -- idempotent: do nothing if already reversed/settled
    RETURN;
  END IF;

  UPDATE billing_credit_ledger
  SET status = 'reversed'
  WHERE ledger_id = p_ledger_id;
END;
$function$;

-- billing_available_credits: Add auth check for consistency
CREATE OR REPLACE FUNCTION public.billing_available_credits(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Authorization: require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  
  -- Authorization: caller must be checking their own credits or be an admin
  IF auth.uid() <> p_user_id THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'unauthorized: cannot view other users credits';
    END IF;
  END IF;

  RETURN COALESCE((
    SELECT available FROM billing_credit_available WHERE user_id = p_user_id
  ), 0);
END;
$function$;