-- Личный кабинет, этап 1: профили клиентов.
-- profiles существовала, но не заполнялась. Теперь строка создаётся триггером при регистрации,
-- телефон — зеркало auth.users.phone (подтверждённый номер после OTP; уникальность держит сам Supabase),
-- RLS включён (доступ только через service role в server/api).
-- Запустить в Supabase SQL Editor.

alter table profiles
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Без политик: anon/authenticated ключи не читают чужие телефоны, service role проходит
alter table profiles enable row level security;

create or replace function handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (user_id, name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.phone, '')
  )
  on conflict (user_id) do update set phone = excluded.phone;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- Смена/подтверждение номера идёт через Supabase Auth (OTP) — профиль только повторяет её
create or replace function sync_profile_phone() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles set phone = nullif(new.phone, '') where user_id = new.id;

  return new;
end $$;

drop trigger if exists on_auth_user_phone_updated on auth.users;

create trigger on_auth_user_phone_updated
  after update of phone on auth.users
  for each row execute function sync_profile_phone();

create or replace function set_profiles_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();

  return new;
end $$;

drop trigger if exists profiles_set_updated_at on profiles;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_profiles_updated_at();

-- Бэкфилл уже существующих пользователей
insert into profiles (user_id, name, phone)
select id, nullif(raw_user_meta_data->>'name', ''), nullif(phone, '')
from auth.users
on conflict (user_id) do nothing;
