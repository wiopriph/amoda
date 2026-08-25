-- Выборочные товары для hero главной («Destaque» в админке)
-- и новые тексты hero (вариант А без TikTok). Запустить в Supabase SQL Editor.

alter table products
  add column if not exists featured boolean not null default false;

create index if not exists products_featured_idx
  on products (featured)
  where featured;

-- Тексты активного hero-варианта; tiktok-поля блоком больше не используются
update home_hero_variants set
  title = 'Moda feminina em Luanda. Experimenta antes de pagar.',
  subtitle = 'Recebes o teu pedido, provas com calma e pagas só o que gostar.',
  social_proof = 'Entregas em Luanda e nas províncias',
  bullets = array['Sem pagamento online', 'Pagas só o que gostar', 'Troca fácil em 7 dias'],
  cta_primary = 'Ver os looks'
where is_active;
