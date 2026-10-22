-- GNIOT Lost & Found AI - Row Level Security (RLS) Policies

-- Helper function to check if current user is an authorized admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.matches enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.saved_searches enable row level security;

-- PROFILES POLICIES
create policy "Public can read limited profile info"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- ITEMS POLICIES
create policy "Anyone can view open items"
  on public.items for select
  using (status != 'archived' or auth.uid() = owner_id or public.is_admin());

create policy "Authenticated users can create items"
  on public.items for insert
  with check (auth.role() = 'authenticated' and auth.uid() = owner_id);

create policy "Owners can update their own items"
  on public.items for update
  using (auth.uid() = owner_id or public.is_admin());

create policy "Owners or admins can delete items"
  on public.items for delete
  using (auth.uid() = owner_id or public.is_admin());

-- MATCHES POLICIES
create policy "Users can view matches for their items"
  on public.matches for select
  using (
    public.is_admin() or
    exists (
      select 1 from public.items
      where (items.id = matches.lost_item_id or items.id = matches.found_item_id)
        and items.owner_id = auth.uid()
    )
  );

create policy "Admins can manage matches"
  on public.matches for all
  using (public.is_admin());

-- CLAIMS POLICIES
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

create policy "Authenticated users can submit a claim"
  on public.claims for insert
  with check (auth.role() = 'authenticated' and claimant_id = auth.uid());

create policy "Item owner or admin can update claim status"
  on public.claims for update
  using (
    public.is_admin() or
    exists (
      select 1 from public.items
      where items.id = claims.item_id and items.owner_id = auth.uid()
    )
  );

-- NOTIFICATIONS POLICIES
create policy "Users can view their own notifications"
  on public.notifications for select
  using (recipient_id = auth.uid());

create policy "Users can mark their own notifications as read"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "System or authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- AUDIT LOGS POLICIES
create policy "Only admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

create policy "Authenticated users can record audit actions"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

-- SAVED SEARCHES POLICIES
create policy "Users can manage their saved searches"
  on public.saved_searches for all
  using (user_id = auth.uid());

-- STORAGE BUCKET CONFIGURATION (item-photos)
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "Anyone can view item photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

create policy "Authenticated users can upload item photos"
  on storage.objects for insert
  with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');
