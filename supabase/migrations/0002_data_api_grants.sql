grant usage on schema public to anon, authenticated, service_role;

grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;
grant all privileges on table public.profiles to service_role;

grant select on table public.avatars to anon, authenticated;
grant insert, update on table public.avatars to authenticated;
grant all privileges on table public.avatars to service_role;

grant select, insert on table public.wallets to authenticated;
grant all privileges on table public.wallets to service_role;
