-- Create admin alerts table for proactive monitoring
CREATE TABLE public.admin_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'credit_low', 'payment_failed', 'usage_spike', 'subscription_expiring'
  severity text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical' 
  message text NOT NULL,
  user_id uuid, -- nullable, for user-specific alerts
  user_email text, -- denormalized for easier querying
  metadata jsonb NOT NULL DEFAULT '{}', -- extra context like thresholds, amounts, etc.
  status text NOT NULL DEFAULT 'active', -- 'active', 'dismissed', 'resolved'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  dismissed_at timestamp with time zone,
  dismissed_by uuid, -- admin who dismissed it
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can manage all alerts" 
ON public.admin_alerts 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  (
    auth.jwt() ->> 'email' = 'cumbucotrader@gmail.com' OR
    auth.jwt() ->> 'email' = 'scott@sparkwave-ai.com'
  )
);

-- Create indexes for performance
CREATE INDEX idx_admin_alerts_status ON public.admin_alerts(status);
CREATE INDEX idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX idx_admin_alerts_created_at ON public.admin_alerts(created_at);
CREATE INDEX idx_admin_alerts_user_id ON public.admin_alerts(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_alerts_updated_at
BEFORE UPDATE ON public.admin_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();