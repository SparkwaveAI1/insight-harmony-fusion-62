-- Grant 1000 test credits to the real user
INSERT INTO billing_credit_ledger (user_id, credits_delta, source, status, action_type, metadata)
VALUES ('ca3d7da3-47f7-4827-b524-935a0e59a505', 1000, 'testing', 'settled', 'manual_grant', '{"reason": "temporary testing bypass"}');