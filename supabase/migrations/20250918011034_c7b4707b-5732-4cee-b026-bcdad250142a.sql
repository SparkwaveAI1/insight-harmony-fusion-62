-- 0) Safety: do a quick backup (optional but recommended)
-- select count(*) from v4_personas;
-- create table v4_personas_backup as table v4_personas;

-- 1) Add generated selector columns (no app code change required)
do $$
begin
  -- education_level on identity
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'v4_personas' and column_name = 'education_level'
  ) then
    execute $g$
      alter table v4_personas
      add column education_level text
      generated always as ((data->'identity'->>'education_level')) stored
    $g$;
  end if;

  -- income_bracket on identity
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'v4_personas' and column_name = 'income_bracket'
  ) then
    execute $g$
      alter table v4_personas
      add column income_bracket text
      generated always as ((data->'identity'->>'income_bracket')) stored
    $g$;
  end if;

  -- thought_coherence on cognitive_profile
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'v4_personas' and column_name = 'thought_coherence'
  ) then
    execute $g$
      alter table v4_personas
      add column thought_coherence numeric
      generated always as (((data->'cognitive_profile'->>'thought_coherence')::numeric)) stored
    $g$;
  end if;
end$$;

-- 2) Upsert identity.education_level from knowledge_profile.education_level when missing
update v4_personas
set data = jsonb_set(
            data,
            '{identity,education_level}',
            coalesce(to_jsonb(data->'knowledge_profile'->>'education_level'),
                     to_jsonb('unspecified'::text)),
            true
          )
where (data->'identity'->>'education_level') is null
   or (data->'identity'->>'education_level') = '';

-- 3) Ensure identity.income_bracket exists
update v4_personas
set data = jsonb_set(
            data,
            '{identity,income_bracket}',
            to_jsonb('unspecified'::text),
            true
          )
where (data->'identity'->>'income_bracket') is null;

-- 4) Add humor_profile if missing (plain defaults)
update v4_personas
set data = jsonb_set(
            data,
            '{humor_profile}',
            '{
              "frequency":"moderate",
              "style":["wry"],
              "boundaries":[],
              "targets":[],
              "use_cases":[]
            }'::jsonb,
            true
          )
where data ? 'humor_profile' = false;

-- 5) Add truth_honesty_profile if missing (safe defaults; we're not overfitting here)
update v4_personas
set data = jsonb_set(
            data,
            '{truth_honesty_profile}',
            jsonb_build_object(
              'baseline_honesty', 0.7,
              'situational_variance', jsonb_build_object('work',0.7,'home',0.6,'public',0.6),
              'typical_distortions', '[]'::jsonb,
              'red_lines', '[]'::jsonb,
              'pressure_points', '[]'::jsonb,
              'confession_style', 'plain'
            ),
            true
          )
where data ? 'truth_honesty_profile' = false;

-- 6) Add bias_profile if missing; seed confirmation from inhibitor_profile.confirmation_bias when present
update v4_personas
set data = jsonb_set(
            data,
            '{bias_profile}',
            jsonb_build_object(
              'cognitive', jsonb_build_object(
                'status_quo', 0.5,
                'loss_aversion', 0.5,
                'confirmation', coalesce(nullif((data->'inhibitor_profile'->>'confirmation_bias')::text,'' )::numeric, 0.5),
                'anchoring', 0.5,
                'availability', 0.5,
                'optimism', 0.5,
                'sunk_cost', 0.5,
                'overconfidence', 0.5
              ),
              'mitigations', '[]'::jsonb
            ),
            true
          )
where data ? 'bias_profile' = false;

-- 7) Add cognitive_profile if missing (defaults; you can tune later persona-by-persona)
update v4_personas
set data = jsonb_set(
            data,
            '{cognitive_profile}',
            jsonb_build_object(
              'verbal_fluency', 0.55,
              'abstract_reasoning', 0.55,
              'problem_solving_orientation', 'pragmatic',
              'thought_coherence', 0.55
            ),
            true
          )
where data ? 'cognitive_profile' = false;

-- 8) Merge identity_salience.cultural_background into attitude_narrative (append sentence)
update v4_personas
set data = jsonb_set(
            data,
            '{attitude_narrative}',
            to_jsonb(
              trim(
                both ' '
                from (
                  coalesce(data->>'attitude_narrative','') || 
                  case when data->'identity_salience'->>'cultural_background' is not null
                       then ' ' || (data->'identity_salience'->>'cultural_background')
                       else '' end
                )
              )
            ),
            true
          )
where data ? 'identity_salience';

-- 9) Push contradictions.primary_tension into motivation_profile.want_vs_should_tension.major_conflicts, then drop contradictions
with c as (
  select id,
         data,
         (data->'contradictions'->'primary_tension') as pt
  from v4_personas
  where data ? 'contradictions'
)
update v4_personas p
set data = (
  -- append conflict
  jsonb_set(
    p.data,
    '{motivation_profile,want_vs_should_tension,major_conflicts}',
    coalesce(
      (p.data#>'{motivation_profile,want_vs_should_tension,major_conflicts}'),
      '[]'::jsonb
    ) || coalesce(
      jsonb_build_object(
        'note', coalesce(c.pt->>'description',''),
        'manifestation', coalesce(c.pt->>'manifestation',''),
        'triggers', coalesce(c.pt->'trigger_conditions','[]'::jsonb)
      ),
      '[]'::jsonb
    ),
    true
  )
) - 'contradictions'
from c
where p.id = c.id;

-- 10) Remove deprecated blocks we no longer want stored
update v4_personas
set data = data
          - 'knowledge_profile'
          - 'identity_salience'
          - 'attitude_snapshot'
          - 'political_signals';

-- 11) (Optional) refresh generated columns (not strictly necessary)
analyze v4_personas;