-- category_closure никем не поддерживалась: ветка roupa-intima осталась без предков,
-- из-за чего ломались хлебные крошки и товары ветки выпадали из родительских категорий.
-- Полная пересборка + триггер самоподдержки. Запустить в Supabase SQL Editor.

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

drop trigger if exists categories_closure_rebuild on categories;

-- Категорий десятки — полная пересборка на каждое изменение дерева занимает миллисекунды
create trigger categories_closure_rebuild
  after insert or update of parent_id or delete on categories
  for each statement execute function rebuild_category_closure();

-- Разовая пересборка текущих данных
delete from category_closure;

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
