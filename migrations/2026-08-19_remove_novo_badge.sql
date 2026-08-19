-- «novo» больше не хранится в БД: бейдж вычисляется на сервере автоматически
-- для товаров младше 14 дней (по created_at). Запустить в Supabase SQL Editor.

update products
set badges = array_remove(badges, 'novo')
where 'novo' = any(badges);
