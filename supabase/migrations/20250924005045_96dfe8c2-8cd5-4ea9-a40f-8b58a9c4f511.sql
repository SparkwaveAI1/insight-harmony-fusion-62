-- Add conversation message billing entries
INSERT INTO billing_price_book (action_type, credits_cost, grace_pct) 
VALUES 
('conversation_message', 2, 10),
('grok_conversation', 2, 10);

-- Verify the additions
SELECT action_type, credits_cost, grace_pct, is_active 
FROM billing_price_book 
WHERE action_type IN ('conversation_message', 'grok_conversation', 'persona_query')
ORDER BY action_type;