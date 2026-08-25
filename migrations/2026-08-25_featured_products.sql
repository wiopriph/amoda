-- Выборочные товары для hero главной («Destaque» в админке).
-- Запустить в Supabase SQL Editor.

alter table products
  add column if not exists featured boolean not null default false;

create index if not exists products_featured_idx
  on products (featured)
  where featured;
