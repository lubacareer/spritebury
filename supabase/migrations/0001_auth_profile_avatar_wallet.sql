create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 32)
);

create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique references public.profiles(id) on delete cascade,
  base_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint avatars_base_type_allowed check (base_type in ('townie', 'skater', 'cozy'))
);

create table if not exists public.wallets (
  player_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 250,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallets_non_negative_balance check (balance >= 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists avatars_set_updated_at on public.avatars;
create trigger avatars_set_updated_at
before update on public.avatars
for each row execute function public.set_updated_at();

drop trigger if exists wallets_set_updated_at on public.wallets;
create trigger wallets_set_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.avatars enable row level security;
alter table public.wallets enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
on public.profiles for select
using (true);

drop policy if exists "players can insert their own profile" on public.profiles;
create policy "players can insert their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "players can update their own profile" on public.profiles;
create policy "players can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "avatars are publicly readable" on public.avatars;
create policy "avatars are publicly readable"
on public.avatars for select
using (true);

drop policy if exists "players can insert their own avatar" on public.avatars;
create policy "players can insert their own avatar"
on public.avatars for insert
to authenticated
with check ((select auth.uid()) = player_id);

drop policy if exists "players can update their own avatar" on public.avatars;
create policy "players can update their own avatar"
on public.avatars for update
to authenticated
using ((select auth.uid()) = player_id)
with check ((select auth.uid()) = player_id);

drop policy if exists "players can read their own wallet" on public.wallets;
create policy "players can read their own wallet"
on public.wallets for select
to authenticated
using ((select auth.uid()) = player_id);

drop policy if exists "players can create their starter wallet" on public.wallets;
create policy "players can create their starter wallet"
on public.wallets for insert
to authenticated
with check ((select auth.uid()) = player_id and balance = 250);
