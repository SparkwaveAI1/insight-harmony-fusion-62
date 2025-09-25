-- Add insights engine pricing based on actual usage analysis
INSERT INTO billing_price_book (action_type, credits_cost, grace_pct) 
VALUES ('insights_persona_query', 2, 10);

-- Update Free tier to 100 credits (allows ~6 personas + conversations + 2 medium studies)
UPDATE billing_plans 
SET included_credits = 100 
WHERE name = 'Free';