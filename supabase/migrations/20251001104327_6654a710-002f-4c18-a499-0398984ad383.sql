-- Fix ambiguous column reference in billing_reserve_credits function
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