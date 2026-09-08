-- Личный кабинет, этап 3: избранное на сервере.
-- Гость держит избранное в localStorage, вошедшая клиентка — здесь; при входе локальное сливается в таблицу.
-- RLS включён без политик: доступ только через service role в server/api. Запустить в Supabase SQL Editor.

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table favorites enable row level security;
