alter table public.avatars
drop constraint if exists avatars_base_type_allowed;

alter table public.avatars
add constraint avatars_base_type_allowed
check (base_type in ('female1', 'male1', 'townie', 'skater', 'cozy'));
