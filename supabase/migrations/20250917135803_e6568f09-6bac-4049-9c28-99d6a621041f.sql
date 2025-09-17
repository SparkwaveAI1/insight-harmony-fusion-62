-- Remove redundant id column from v4_personas and make persona_id the primary key
ALTER TABLE public.v4_personas DROP CONSTRAINT v4_personas_pkey;
ALTER TABLE public.v4_personas DROP COLUMN id;
ALTER TABLE public.v4_personas ADD PRIMARY KEY (persona_id);