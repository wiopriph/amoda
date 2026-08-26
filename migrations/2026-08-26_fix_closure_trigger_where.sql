-- Хотфикс: pg-safeupdate (включён у Supabase на API-подключениях) требует WHERE у DELETE,
-- поэтому триггер падал «DELETE requires a WHERE clause» при сохранении категории из админки.
-- Запустить в Supabase SQL Editor.

create or replace function rebuild_category_closure() returns trigger
language plpgsql as $$
begin
  -- Неконстантный WHERE: «where true» Postgres сворачивает до проверки safeupdate
  delete from category_closure where descendant_id is not null;

  insert into category_closure (ancestor_id, descendant_id, depth)
  with recursive tree as (
    select id as descendant_id, id as ancestor_id, 0 as depth
    from categories
    union all
    select t.descendant_id, c.parent_id, t.depth + 1
    from tree t
    join categories c on c.id = t.ancestor_id
    where c.parent_id is not null
  )
  select ancestor_id, descendant_id, depth from tree;

  return null;
end $$;
