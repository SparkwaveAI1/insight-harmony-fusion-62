-- Add indexes for fast pagination and filtering
create index if not exists idx_mem_persona_created_id
  on persona_memories (persona_id, created_at desc, id desc);

create index if not exists idx_global_mem_created_id
  on global_memories (created_at desc, id desc);

create index if not exists idx_collection_personas_persona_added
  on collection_personas (persona_id, added_at desc);

-- Add GIN indexes for tag filtering if needed
create index if not exists idx_mem_tags_gin on persona_memories using gin (tags);
create index if not exists idx_global_tags_gin on global_memories using gin (tags);