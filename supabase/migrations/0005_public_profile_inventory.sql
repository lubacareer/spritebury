grant select on table public.marketplace_products to anon;
grant select on table public.player_products to anon;

drop policy if exists "public can read active marketplace products" on public.marketplace_products;
create policy "public can read active marketplace products"
on public.marketplace_products
for select
to anon, authenticated
using (is_active);

drop policy if exists "public can read profile product ownership" on public.player_products;
create policy "public can read profile product ownership"
on public.player_products
for select
to anon, authenticated
using (true);
