-- Create humor_profile from communication_style.style_markers.humor_style
UPDATE v4_personas
SET full_profile = jsonb_set(
          full_profile,'{humor_profile}',
          jsonb_build_object(
            'frequency','moderate',                       -- frequency left neutral unless we have evidence
            'style', coalesce((full_profile#>'{communication_style,style_markers,humor_style}'),'["dry"]'::jsonb),
            'boundaries','[]'::jsonb,
            'targets','[]'::jsonb,
            'use_cases','[]'::jsonb
          ),
          true
        ),
    evidence_notes = concat_ws(' | ', evidence_notes, 'humor.style from communication_style')
WHERE full_profile ? 'humor_profile' = false
  AND full_profile#>'{communication_style,style_markers,humor_style}' IS NOT NULL;