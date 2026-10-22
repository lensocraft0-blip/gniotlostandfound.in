-- GNIOT Lost & Found AI - Security Upgrade & Administrative Allowlist Migration
-- Enforces server-side authorization and Row Level Security hardening

-- 1. Create trusted admin allowlist table (managed exclusively by database owner / service role)
create table if not exists public.admin_allowlist (
  email text primary key,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Protect admin_allowlist table with RLS
alter table public.admin_allowlist enable row level security;

-- Read policy: only authenticated admins or service role
create policy "Allow admins to read admin allowlist"
  on public.admin_allowlist for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- 2. Security Definer function to check if the current user is an authorized admin
create or replace function public.is_admin()
returns boolean as $$
declare
  current_user_email text;
begin
  -- Check user email from auth token
  current_user_email := auth.jwt() ->> 'email';

  -- Authorized if email exists in admin_allowlist
  if current_user_email is not null and exists (
    select 1 from public.admin_allowlist
    where lower(email) = lower(current_user_email)
  ) then
    return true;
  end if;

  -- Also check if verified admin in profiles table
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- 3. Prevent users from self-assigning is_admin in profiles table
create or replace function public.protect_admin_flag()
returns trigger as $$
begin
  -- If is_admin is being altered and user is NOT an authorized admin
  if (new.is_admin is distinct from old.is_admin) then
    if not public.is_admin() then
      new.is_admin := old.is_admin; -- discard unauthorized tampering
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_admin_flag on public.profiles;
create trigger tr_protect_admin_flag
  before update on public.profiles
  for each row execute function public.protect_admin_flag();

-- 4. Extend claims status enum to support 'evidence_requested'
alter table public.claims drop constraint if exists claims_status_check;
alter table public.claims add constraint claims_status_check
  check (status in ('pending', 'under_review', 'evidence_requested', 'approved', 'rejected'));

-- 5. Harden Claim Access Policies:
-- Private verification answers and finder expected answers must NEVER be visible to public or other claimants
drop policy if exists "Claimants can view their own claims" on public.claims;
create policy "Claimants can view their own claims"
  on public.claims for select
  using (
    claimant_id = auth.uid() or
    public.is_admin() or
    exists (
      select 1 from public.items
      where items.id = claims.item_id and items.owner_id = auth.uid()
    )
  );

-- 6. Add rate-limiting / deduplication index for item reports
create index if not exists idx_items_dedup on public.items (owner_id, title, category, event_date);
