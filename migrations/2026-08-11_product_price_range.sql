-- Диапазон цен товара (min/max по вариантам) для сортировки по цене на стороне БД.
-- До этого сортировка по цене делалась в JS поверх выборки, ограниченной 1000 строк.
-- Запустить в Supabase SQL Editor.

alter table products
  add column if not exists min_price numeric,
  add column if not exists max_price numeric;

create or replace function refresh_product_price_range() returns trigger
language plpgsql as $$
declare
  pids bigint[];
begin
  pids := array_remove(array[
    case when tg_op in ('INSERT', 'UPDATE') then new.product_id end,
    case when tg_op in ('DELETE', 'UPDATE') then old.product_id end
  ], null);

  update products p set
    min_price = (select min(price) from product_variants v where v.product_id = p.id),
    max_price = (select max(price) from product_variants v where v.product_id = p.id)
  where p.id = any(pids);

  return null;
end $$;

drop trigger if exists product_variants_price_range on product_variants;

create trigger product_variants_price_range
  after insert or update of price, product_id or delete on product_variants
  for each row execute function refresh_product_price_range();

-- Бэкфилл существующих товаров
update products p set
  min_price = (select min(price) from product_variants v where v.product_id = p.id),
  max_price = (select max(price) from product_variants v where v.product_id = p.id);

create index if not exists products_min_price_idx on products (min_price);
create index if not exists products_max_price_idx on products (max_price);
