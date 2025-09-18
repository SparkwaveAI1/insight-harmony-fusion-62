-- Update missing_fields array based on what's missing in full_profile
UPDATE v4_personas
SET missing_fields = array_remove(array[
  CASE WHEN full_profile ? 'humor_profile' THEN null ELSE 'humor_profile' END,
  CASE WHEN full_profile ? 'truth_honesty_profile' THEN null ELSE 'truth_honesty_profile' END,
  CASE WHEN full_profile ? 'bias_profile' THEN null ELSE 'bias_profile' END,
  CASE WHEN full_profile ? 'cognitive_profile' THEN null ELSE 'cognitive_profile' END,
  CASE WHEN (full_profile->'identity'->>'education_level') IS NULL THEN 'identity.education_level' END,
  CASE WHEN (full_profile->'identity'->>'income_bracket') IS NULL THEN 'identity.income_bracket' END
], null);