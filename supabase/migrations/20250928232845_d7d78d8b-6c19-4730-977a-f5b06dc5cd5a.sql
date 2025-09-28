-- Add insights_survey action type to billing price book
-- $0.02 per question per persona = 2 credits per question per persona
INSERT INTO billing_price_book (action_type, credits_cost, model, effective_from, is_active)
VALUES ('insights_survey', 2, 'per_question_per_persona', NOW(), true);