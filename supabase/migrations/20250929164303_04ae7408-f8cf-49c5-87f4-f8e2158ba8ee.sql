-- Create function to handle new user signup and grant credits
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS trigger_new_user_signup ON auth.users;
CREATE TRIGGER trigger_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();