-- Тексты hero перенесены в код (app/components/HomeHero.vue), endpoint /api/home/hero удалён.
-- ЗАПУСКАТЬ ТОЛЬКО ПОСЛЕ РЕЛИЗА нового фронта: старый код читает эту таблицу.
-- Дамп последней строки сохранён в migrations/backup-home_hero_variants-2026-08-25.json

drop table if exists home_hero_variants;
