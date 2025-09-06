-- Add billing_states table for tracking Stripe subscription state
CREATE TABLE IF NOT EXISTS public.billing_states (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES billing_plans(plan_id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  dunning_stage INTEGER NOT NULL DEFAULT 0,   -- 0=ok, 1=retry, 2=final
  last_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_states ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own billing state" 
ON public.billing_states 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage billing states" 
ON public.billing_states 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_billing_states_updated_at
BEFORE UPDATE ON public.billing_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add stripe_customer_id to billing_profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'billing_profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.billing_profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;