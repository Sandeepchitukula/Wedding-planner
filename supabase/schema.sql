-- Wedding Planner — full schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query → paste → Run)

create extension if not exists "uuid-ossp";

-- People who are managing things (family members, coordinators)
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Vendors: photographer, caterer, decorator, etc.
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  contact_person text,
  phone text,
  status text not null default 'enquired',
  cost_quoted numeric,
  advance_paid numeric default 0,
  managed_by uuid references team_members(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

-- Budget line items, optionally tied to a vendor
create table budget_items (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  item_name text not null,
  estimated_cost numeric not null default 0,
  actual_cost numeric,
  paid_amount numeric default 0,
  vendor_id uuid references vendors(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

-- Tasks / checklist items
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text,
  description text,
  due_date date,
  status text not null default 'pending',
  priority text not null default 'medium',
  assigned_to uuid references team_members(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  created_at timestamptz default now()
);

-- Day-of-event timeline
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  responsible uuid references team_members(id) on delete set null,
  description text,
  created_at timestamptz default now()
);

-- Guest list
create table guests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  side text,
  category text,
  headcount int default 1,
  rsvp_status text not null default 'pending',
  phone text,
  invited_by uuid references team_members(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

alter table team_members enable row level security;
alter table vendors enable row level security;
alter table budget_items enable row level security;
alter table tasks enable row level security;
alter table events enable row level security;
alter table guests enable row level security;

create policy "Authenticated full access" on team_members for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on vendors for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on budget_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on tasks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on events for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on guests for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
