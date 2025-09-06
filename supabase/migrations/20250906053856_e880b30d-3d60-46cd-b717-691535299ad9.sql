-- Insert test billing profile for the current user with Starter plan
INSERT INTO billing_profiles (user_id, plan_id, renewal_date, auto_renew)
VALUES (
  '9a02d71b-0561-425f-9adf-150243905530',
  '5b85359f-1ff8-4849-8d9c-24c3e9db105a', -- Starter plan ID
  (now() + interval '27 days')::timestamp with time zone, -- Renews in 27 days
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  renewal_date = EXCLUDED.renewal_date,
  auto_renew = EXCLUDED.auto_renew;

-- Insert settled credit ledger entries to create a balance of 85 credits
INSERT INTO billing_credit_ledger (user_id, action_type, credits_delta, source, status, metadata)
VALUES 
  ('9a02d71b-0561-425f-9adf-150243905530', 'credit_pack', 100, 'credit_pack', 'settled', '{"stripe_session": "cs_test_123"}'),
  ('9a02d71b-0561-425f-9adf-150243905530', 'persona_chat', -15, 'usage', 'settled', '{"session_id": "test1"}');

-- Insert some test usage data for current month
INSERT INTO billing_usage_log (user_id, action_type, credits_spent, metadata)
VALUES 
  ('9a02d71b-0561-425f-9adf-150243905530', 'persona_chat', 15, '{"session_id": "test1"}'),
  ('9a02d71b-0561-425f-9adf-150243905530', 'persona_generation', 25, '{"persona_id": "test2"}'),
  ('9a02d71b-0561-425f-9adf-150243905530', 'research_survey', 10, '{"survey_id": "test3"}');