-- Joey x Circle K merchandising survey schema
-- Run in Supabase SQL editor, then import stores via scripts/import-stores.mjs

create table if not exists public.stores (
  site_number text primary key,
  business_unit text,
  address text,
  city text,
  state text,
  zip text,
  reset_date text,
  reset_note text,
  pog_set text,
  rep_name text,
  assigned_to text,
  closing boolean default false,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- If stores table already exists, add coordinates:
-- alter table public.stores add column if not exists lat double precision;
-- alter table public.stores add column if not exists lng double precision;

create index if not exists stores_assigned_to_idx on public.stores (assigned_to);
create index if not exists stores_business_unit_idx on public.stores (business_unit);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  store_number text not null references public.stores(site_number),
  store_city text,
  store_address text,
  store_state text,
  business_unit text,
  pog_set text,
  reset_date text,
  visit_date timestamptz not null default now(),
  cycle_key text not null default to_char(now() at time zone 'America/New_York', 'YYYY-"Q"Q'),
  rep_name text,
  submitted_by text,
  status text not null default 'submitted',
  followup boolean default false,
  flags text[] default '{}',
  survey_data jsonb not null default '{}'::jsonb,
  photo_urls jsonb not null default '{}'::jsonb,
  gps jsonb,
  created_at timestamptz default now()
);

-- One completed submission per store per quarter/cycle
create unique index if not exists visits_store_cycle_unique
  on public.visits (store_number, cycle_key)
  where status in ('submitted', 'qualified', 'in_review');

create index if not exists visits_submitted_by_idx on public.visits (submitted_by);
create index if not exists visits_followup_idx on public.visits (followup);
create index if not exists visits_created_at_idx on public.visits (created_at desc);

-- Photos bucket (create once in Storage UI or via API)
-- insert into storage.buckets (id, name, public) values ('visit-photos', 'visit-photos', true)
--   on conflict do nothing;

alter table public.stores enable row level security;
alter table public.visits enable row level security;

drop policy if exists "stores read" on public.stores;
create policy "stores read" on public.stores for select using (true);

drop policy if exists "stores write" on public.stores;
create policy "stores write" on public.stores for all using (true) with check (true);

drop policy if exists "visits read" on public.visits;
create policy "visits read" on public.visits for select using (true);

drop policy if exists "visits insert" on public.visits;
create policy "visits insert" on public.visits for insert with check (true);

drop policy if exists "visits update" on public.visits;
create policy "visits update" on public.visits for update using (true) with check (true);
