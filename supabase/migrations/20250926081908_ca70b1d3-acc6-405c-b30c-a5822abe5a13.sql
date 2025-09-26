-- Grant 1000 test credits to persona owner for testing
INSERT INTO billing_credit_ledger (user_id, credits_delta, source, status, action_type, metadata)
VALUES ('9a02d71b-0561-425f-9adf-150243905530', 1000, 'testing', 'settled', 'manual_grant', '{"reason": "temporary testing bypass for persona owner"}');