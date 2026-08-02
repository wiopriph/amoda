-- Привязка размеров к модификациям МойСклад по UUID (assortmentId в отчётах остатков).
-- Запустить в Supabase SQL Editor. ms_code остаётся как справочное поле.

alter table product_variant_sizes
  add column if not exists ms_variant_id uuid;

create index if not exists product_variant_sizes_ms_variant_id_idx
  on product_variant_sizes (ms_variant_id)
  where ms_variant_id is not null;
