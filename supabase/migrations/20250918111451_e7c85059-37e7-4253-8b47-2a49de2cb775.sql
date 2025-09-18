-- Remove typical_openers from existing persona records
UPDATE v4_personas 
SET full_profile = jsonb_set(
  full_profile,
  '{communication_style,linguistic_signature}',
  (full_profile->'communication_style'->'linguistic_signature') - 'typical_openers'
)
WHERE full_profile->'communication_style'->'linguistic_signature' ? 'typical_openers';

-- Also clean up any typical_openers references in prompt_shaping
UPDATE v4_personas 
SET full_profile = jsonb_set(
  full_profile,
  '{prompt_shaping}',
  (full_profile->'prompt_shaping') - 'typical_openers'
)
WHERE full_profile->'prompt_shaping' ? 'typical_openers';

-- Clean up any nested typical_openers in other locations
UPDATE v4_personas 
SET full_profile = jsonb_set(
  full_profile,
  '{communication_style}',
  (full_profile->'communication_style') - 'typical_openers'
)
WHERE full_profile->'communication_style' ? 'typical_openers';