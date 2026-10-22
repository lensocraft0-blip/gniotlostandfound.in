-- GNIOT Lost & Found AI Database Schema Migration
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  campus_role text check (campus_role in ('student', 'faculty', 'staff', 'admin')) default 'student',
  student_identifier text, -- e.g. GNIOT-2023-CS-104 (private)
  department text, -- e.g. CSE, IT, ECE, Mechanical, MBA
  avatar_path text,
  phone text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookup
create index if not exists idx_profiles_role on public.profiles(campus_role);
create index if not exists idx_profiles_is_admin on public.profiles(is_admin);

-- 2. ITEMS TABLE
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  report_type text check (report_type in ('lost', 'found')) not null,
  title text not null,
  category text not null,
  description text not null,
  brand text,
  color text,
  event_date date,
  event_time text,
  reported_at timestamp with time zone default timezone('utc'::text, now()) not null,
  campus_location text not null,
  campus_zone text,
  image_paths text[] default array[]::text[],
  status text check (status in ('open', 'potential_match', 'claimed', 'resolved', 'archived')) default 'open',
  contact_preference text check (contact_preference in ('in_app', 'email', 'helpdesk')) default 'in_app',
  private_verification_question text,
  private_verification_answer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_items_report_type on public.items(report_type);
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_category on public.items(category);
create index if not exists idx_items_campus_location on public.items(campus_location);
create index if not exists idx_items_owner on public.items(owner_id);
create index if not exists idx_items_reported_at on public.items(reported_at desc);

-- 3. MATCHES TABLE
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  lost_item_id uuid references public.items(id) on delete cascade not null,
  found_item_id uuid references public.items(id) on delete cascade not null,
  score integer check (score >= 0 and score <= 100) not null,
  explanation text not null,
  status text check (status in ('pending', 'reviewed', 'confirmed_match', 'dismissed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_item_match unique(lost_item_id, found_item_id)
);

create index if not exists idx_matches_lost on public.matches(lost_item_id);
create index if not exists idx_matches_found on public.matches(found_item_id);
create index if not exists idx_matches_score on public.matches(score desc);

-- 4. CLAIMS TABLE
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade not null,
  claimant_id uuid references auth.users(id) on delete cascade not null,
  private_verification_answers text not null,
  evidence_paths text[] default array[]::text[],
  status text check (status in ('pending', 'under_review', 'approved', 'rejected')) default 'pending',
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_claims_item on public.claims(item_id);
create index if not exists idx_claims_claimant on public.claims(claimant_id);
create index if not exists idx_claims_status on public.claims(status);

-- 5. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('match_found', 'claim_submitted', 'claim_approved', 'claim_rejected', 'status_changed', 'admin_notice')) not null,
  title text not null,
  message text not null,
  related_item_id uuid references public.items(id) on delete set null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_recipient on public.notifications(recipient_id);
create index if not exists idx_notifications_read on public.notifications(read_at);

-- 6. AUDIT_LOGS TABLE
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_audit_created_at on public.audit_logs(created_at desc);

-- 7. SAVED_SEARCHES TABLE
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  query text,
  category text,
  location text,
  report_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, campus_role, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'campus_role', 'student'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
