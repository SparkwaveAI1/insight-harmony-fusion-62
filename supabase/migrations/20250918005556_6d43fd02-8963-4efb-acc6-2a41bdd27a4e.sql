-- One-time (if not already enabled)
create extension if not exists pgcrypto;   -- for gen_random_uuid()
create extension if not exists pg_trgm;    -- for trigram search

-- 1) New table holding the full v2 JSON plus a few generated fields for querying
create table if not exists persona_v2 (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Full new schema stored here
  data          jsonb not null,

  -- Generated selectors (fast filters/sorts without touching JSON)
  name              text generated always as ((data->'identity'->>'name')) stored,
  age               int  generated always as (((data->'identity'->>'age'))::int) stored,
  gender            text generated always as (lower(data->'identity'->>'gender')) stored,
  ethnicity         text generated always as ((data->'identity'->>'ethnicity')) stored,
  occupation        text generated always as ((data->'identity'->>'occupation')) stored,
  education_level   text generated always as ((data->'identity'->>'education_level')) stored,
  income_bracket    text generated always as ((data->'identity'->>'income_bracket')) stored,
  city              text generated always as ((data->'identity'->'location'->>'city')) stored,
  region            text generated always as ((data->'identity'->'location'->>'region')) stored,
  urbanicity        text generated always as ((data->'identity'->'location'->>'urbanicity')) stored,

  thought_coherence numeric generated always as (((data->'cognitive_profile'->>'thought_coherence'))::numeric) stored,

  -- Minimal shape checks so we fail fast if a top-level block is missing
  constraint persona_v2_required_keys check (
    data ? 'identity'
    and data ? 'daily_life'
    and data ? 'health_profile'
    and data ? 'relationships'
    and data ? 'money_profile'
    and data ? 'motivation_profile'
    and data ? 'communication_style'
    and data ? 'humor_profile'
    and data ? 'truth_honesty_profile'
    and data ? 'bias_profile'
    and data ? 'cognitive_profile'
    and data ? 'attitude_narrative'
    and data ? 'political_narrative'
    and data ? 'adoption_profile'
    and data ? 'prompt_shaping'
  ),
  constraint persona_v2_coherence_range check (
    thought_coherence is null or (thought_coherence >= 0 and thought_coherence <= 1)
  )
);

-- 2) Updated-at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists trg_persona_v2_updated_at on persona_v2;
create trigger trg_persona_v2_updated_at
before update on persona_v2
for each row execute function set_updated_at();

-- 3) Indexes (fast lookup & search)
create index if not exists idx_persona_v2_data_gin
  on persona_v2 using gin (data jsonb_path_ops);

create index if not exists idx_persona_v2_name_trgm
  on persona_v2 using gin (lower(name) gin_trgm_ops);

create index if not exists idx_persona_v2_filters
  on persona_v2 (occupation, education_level, income_bracket, region, urbanicity);

create index if not exists idx_persona_v2_age
  on persona_v2 (age);

create index if not exists idx_persona_v2_thought_coherence
  on persona_v2 (thought_coherence);