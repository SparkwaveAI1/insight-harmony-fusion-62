-- Drop and recreate the handle_new_user_signup function to grant credits directly
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_existing_credit RECORD;
BEGIN
  -- Check if user already received signup credits (idempotency)
  SELECT ledger_id INTO v_existing_credit
  FROM billing_credit_ledger
  WHERE user_id = NEW.id
    AND source = 'signup_bonus'
  LIMIT 1;

  -- If credits already granted, exit early
  IF FOUND THEN
    RAISE LOG 'User % already received signup credits', NEW.id;
    RETURN NEW;
  END IF;

  -- Grant 200 free credits directly in the database
  INSERT INTO billing_credit_ledger (
    user_id,
    credits_delta,
    source,
    status,
    action_type,
    metadata
  ) VALUES (
    NEW.id,
    200,
    'signup_bonus',
    'settled',
    'signup_grant',
    jsonb_build_object(
      'granted_at', now(),
      'amount', 200,
      'reason', 'New user signup bonus'
    )
  );

  -- Create admin alert for new user signup (best effort, non-blocking)
  BEGIN
    INSERT INTO admin_alerts (
      type,
      severity,
      message,
      user_id,
      user_email,
      status,
      metadata
    ) VALUES (
      'user_signup',
      'low',
      'New user signed up: ' || COALESCE(NEW.email, 'unknown'),
      NEW.id,
      NEW.email,
      'active',
      jsonb_build_object(
        'credits_granted', 200,
        'signup_date', now()
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Don't let alert creation failure affect signup
    RAISE LOG 'Failed to create admin alert for user %: %', NEW.id, SQLERRM;
  END;

  RAISE LOG 'Successfully granted 200 signup credits to user %', NEW.id;
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent user signup
  RAISE LOG 'Failed to grant signup credits for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

-- Backfill credits for the 85 users who didn't receive them
-- This is a one-time operation to fix existing users
DO $$
DECLARE
  v_user RECORD;
  v_backfilled_count INT := 0;
BEGIN
  -- Find all users who signed up but never received signup credits
  FOR v_user IN (
    SELECT DISTINCT au.id, au.email
    FROM auth.users au
    WHERE au.created_at > '2024-01-01'
      AND NOT EXISTS (
        SELECT 1 
        FROM billing_credit_ledger bcl 
        WHERE bcl.user_id = au.id 
          AND bcl.source = 'signup_bonus'
      )
  )
  LOOP
    -- Grant 200 credits to each affected user
    INSERT INTO billing_credit_ledger (
      user_id,
      credits_delta,
      source,
      status,
      action_type,
      metadata
    ) VALUES (
      v_user.id,
      200,
      'signup_bonus',
      'settled',
      'signup_grant',
      jsonb_build_object(
        'granted_at', now(),
        'amount', 200,
        'reason', 'Backfill - New user signup bonus',
        'backfilled', true
      )
    );
    
    v_backfilled_count := v_backfilled_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Backfilled signup credits for % users', v_backfilled_count;
END $$;