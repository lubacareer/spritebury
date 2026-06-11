create table if not exists public.marketplace_products (
  id text primary key,
  product_type text not null,
  name text not null,
  description text not null default '',
  price integer not null,
  asset_path text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_products_id_format check (id ~ '^[a-z0-9_]{3,64}$'),
  constraint marketplace_products_type_format check (product_type ~ '^[a-z0-9_]{2,32}$'),
  constraint marketplace_products_price_positive check (price > 0),
  constraint marketplace_products_asset_path_local check (asset_path ~ '^/assets/[a-zA-Z0-9_./-]+$')
);

create table if not exists public.player_products (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.marketplace_products(id) on delete restrict,
  acquired_at timestamptz not null default now(),
  constraint player_products_player_product_unique unique (player_id, product_id)
);

create table if not exists public.currency_ledger (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  balance_after integer not null,
  reason text not null,
  product_id text references public.marketplace_products(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint currency_ledger_amount_not_zero check (amount <> 0),
  constraint currency_ledger_balance_after_non_negative check (balance_after >= 0),
  constraint currency_ledger_reason_format check (reason ~ '^[a-z0-9_]{3,64}$')
);

create table if not exists public.purchase_transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.marketplace_products(id) on delete restrict,
  price_paid integer not null,
  ledger_id uuid not null references public.currency_ledger(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint purchase_transactions_player_product_unique unique (player_id, product_id),
  constraint purchase_transactions_price_positive check (price_paid > 0)
);

drop trigger if exists marketplace_products_set_updated_at on public.marketplace_products;
create trigger marketplace_products_set_updated_at
before update on public.marketplace_products
for each row
execute function public.set_updated_at();

create index if not exists marketplace_products_active_sort_idx
on public.marketplace_products (is_active, sort_order, id);

create index if not exists player_products_player_id_idx
on public.player_products (player_id, acquired_at desc);

create index if not exists currency_ledger_player_id_idx
on public.currency_ledger (player_id, created_at desc);

create index if not exists purchase_transactions_player_id_idx
on public.purchase_transactions (player_id, created_at desc);

alter table public.marketplace_products enable row level security;
alter table public.player_products enable row level security;
alter table public.currency_ledger enable row level security;
alter table public.purchase_transactions enable row level security;

drop policy if exists "authenticated players can read active products" on public.marketplace_products;
create policy "authenticated players can read active products"
on public.marketplace_products
for select
to authenticated
using (is_active);

drop policy if exists "players can read their own product ownership" on public.player_products;
create policy "players can read their own product ownership"
on public.player_products
for select
to authenticated
using ((select auth.uid()) = player_id);

drop policy if exists "players can read their own currency ledger" on public.currency_ledger;
create policy "players can read their own currency ledger"
on public.currency_ledger
for select
to authenticated
using ((select auth.uid()) = player_id);

drop policy if exists "players can read their own purchase transactions" on public.purchase_transactions;
create policy "players can read their own purchase transactions"
on public.purchase_transactions
for select
to authenticated
using ((select auth.uid()) = player_id);

insert into public.marketplace_products
  (id, product_type, name, description, price, asset_path, is_active, sort_order)
values
  ('room_livingroom', 'room', 'Living Room', 'A cozy starter room with a couch, plants, and shelves.', 80, '/assets/livingroom.png', true, 10),
  ('room_bedroom', 'room', 'Bedroom', 'A calm bedroom with a soft bed, dresser, and mirror.', 90, '/assets/bedroom.png', true, 20),
  ('room_bathroom', 'room', 'Bathroom', 'A bright tiled bathroom with a tub, sink, and cabinet.', 70, '/assets/bathroom.png', true, 30)
on conflict (id) do update
set
  product_type = excluded.product_type,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  asset_path = excluded.asset_path,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

create or replace function public.buy_marketplace_product(p_product_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_player_id uuid := (select auth.uid());
  product_record public.marketplace_products%rowtype;
  current_balance integer;
  new_balance integer;
  ledger_record_id uuid;
begin
  if current_player_id is null then
    raise exception 'not_authenticated'
      using errcode = '28000';
  end if;

  select *
  into product_record
  from public.marketplace_products
  where id = p_product_id
    and is_active = true;

  if not found then
    raise exception 'product_not_found'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.player_products
    where player_id = current_player_id
      and product_id = p_product_id
  ) then
    raise exception 'product_already_owned'
      using errcode = 'P0001';
  end if;

  select balance
  into current_balance
  from public.wallets
  where player_id = current_player_id
  for update;

  if not found then
    raise exception 'wallet_not_found'
      using errcode = 'P0001';
  end if;

  if current_balance < product_record.price then
    raise exception 'insufficient_funds'
      using errcode = 'P0001';
  end if;

  new_balance := current_balance - product_record.price;

  update public.wallets
  set balance = new_balance
  where player_id = current_player_id;

  insert into public.player_products (player_id, product_id)
  values (current_player_id, product_record.id);

  insert into public.currency_ledger
    (player_id, amount, balance_after, reason, product_id)
  values
    (
      current_player_id,
      -product_record.price,
      new_balance,
      'marketplace_purchase',
      product_record.id
    )
  returning id into ledger_record_id;

  insert into public.purchase_transactions
    (player_id, product_id, price_paid, ledger_id)
  values
    (
      current_player_id,
      product_record.id,
      product_record.price,
      ledger_record_id
    );

  return jsonb_build_object(
    'product_id', product_record.id,
    'balance', new_balance
  );
end;
$$;

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.marketplace_products to authenticated;
grant select on table public.player_products to authenticated;
grant select on table public.currency_ledger to authenticated;
grant select on table public.purchase_transactions to authenticated;

grant all privileges on table public.marketplace_products to service_role;
grant all privileges on table public.player_products to service_role;
grant all privileges on table public.currency_ledger to service_role;
grant all privileges on table public.purchase_transactions to service_role;

revoke all on function public.buy_marketplace_product(text) from public;
revoke all on function public.buy_marketplace_product(text) from anon;
grant execute on function public.buy_marketplace_product(text) to authenticated;
