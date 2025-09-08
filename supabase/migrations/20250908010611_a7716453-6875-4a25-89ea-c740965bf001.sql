-- === PERSONA MEMORIES ========================================================
create table if not exists persona_memories (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null, -- references v4_personas(persona_id) 
  type text not null check (type in ('conversation','fact','note','global')),
  title text,
  content jsonb not null,         -- store {text: "..."} now; extensible later
  source text,                    -- 'upload','admin','system','api'
  tags text[] default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_persona_memories_persona_created
  on persona_memories(persona_id, created_at desc);
create index if not exists idx_persona_memories_tags
  on persona_memories using gin(tags);

-- RLS
alter table persona_memories enable row level security;

drop policy if exists persona_owner_read on persona_memories;
create policy persona_owner_read on persona_memories
  for select using (exists (
    select 1 from v4_personas p
    where p.persona_id = persona_memories.persona_id and p.user_id = auth.uid()
  ));

drop policy if exists persona_owner_write on persona_memories;
create policy persona_owner_write on persona_memories
  for insert with check (exists (
    select 1 from v4_personas p
    where p.persona_id = persona_memories.persona_id and p.user_id = auth.uid()
  ));

-- === GLOBAL MEMORIES (admin-authored broadcast facts) =======================
create table if not exists global_memories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('fact','note')),
  title text,
  content jsonb not null,
  tags text[] default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_global_memories_created
  on global_memories(created_at desc);
create index if not exists idx_global_memories_tags
  on global_memories using gin(tags);

alter table global_memories enable row level security;

-- Read via edge functions only; block direct anon writes.
drop policy if exists global_read_any on global_memories;
create policy global_read_any on global_memories for select using (true);

drop policy if exists global_write_none on global_memories;
create policy global_write_none on global_memories
  for all using (false) with check (false);