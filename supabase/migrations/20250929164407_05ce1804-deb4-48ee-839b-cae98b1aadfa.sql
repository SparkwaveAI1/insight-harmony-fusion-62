-- Fix the handle_new_user_signup function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to grant signup credits
  PERFORM
    net.http_post(
      url := 'https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/auto-grant-signup-credits',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('userId', NEW.id::text)
    );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent user signup
  RAISE LOG 'Failed to grant signup credits for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;