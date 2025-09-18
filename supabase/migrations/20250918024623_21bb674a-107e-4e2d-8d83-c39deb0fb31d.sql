-- Create/update bias_profile from inhibitor_profile data
UPDATE v4_personas
SET full_profile = jsonb_set(
  full_profile,'{bias_profile}',
  coalesce(full_profile->'bias_profile','{}'::jsonb) ||
  jsonb_build_object(
    'cognitive',
    (coalesce(full_profile#>'{bias_profile,cognitive}','{}'::jsonb)) ||
    jsonb_build_object(
      'loss_aversion', coalesce((full_profile->'inhibitor_profile'->>'consequence_aversion')::numeric, 0.5),
      'status_quo',    coalesce((full_profile#>>'{inhibitor_profile,learned_avoidance,domain}')::numeric, 0.5),
      'overconfidence',coalesce((full_profile->'inhibitor_profile'->>'confidence_level')::numeric, 0.5)
    )
  ),
  true
),
evidence_notes = concat_ws(' | ', evidence_notes, 'bias from inhibitor_profile')
WHERE (full_profile->'inhibitor_profile') IS NOT NULL;