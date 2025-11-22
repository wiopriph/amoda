import { serverSupabaseClient } from '#supabase/server';


type QueryParams = {
  slug?: string
};

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
};

type NavigationItem = {
  slug: string
  name: string
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const query = getQuery(event) as QueryParams;

  let currentCategory: Category | null = null;
  let parentCategory: Category | null = null;
  let navigation: NavigationItem[] = [];

  // --- 1. Если slug нет → отдаём верхние категории ---
  if (!query.slug) {
    const { data: topCategories, error: topErr } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .is('parent_id', null)
      .order('name', { ascending: true });

    if (topErr) {
      throw createError({ statusCode: 500, statusMessage: topErr.message });
    }

    return (topCategories || []).map((c: Category) => ({
      slug: c.slug,
      name: c.name,
    }));
  }

  // --- 2. Есть slug → ищем категорию ---
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .eq('slug', String(query.slug))
    .maybeSingle();

  if (catErr) {
    throw createError({ statusCode: 500, statusMessage: catErr.message });
  }

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }

  currentCategory = category as Category;

  // --- 3. Ищем родителя ---
  if (currentCategory.parent_id !== null) {
    const { data: parentRow } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('id', currentCategory.parent_id)
      .maybeSingle();

    if (parentRow) parentCategory = parentRow as Category;
  }

  // --- 4. Ищем детей текущей категории ---
  const { data: children } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .eq('parent_id', currentCategory.id)
    .order('name', { ascending: true });

  if (children && children.length > 0) {
    // структура: parent → current → children
    if (parentCategory) {
      navigation.push({
        slug: parentCategory.slug,
        name: parentCategory.name,
      });
    }

    navigation.push({
      slug: currentCategory.slug,
      name: currentCategory.name,
    });

    navigation.push(
      ...children.map((c: Category) => ({
        slug: c.slug,
        name: c.name,
      })),
    );
  } else {
    // --- 5. Нет детей → ищем соседей ---
    let siblings: Category[] = [];

    if (parentCategory) {
      const { data: siblingRows } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .eq('parent_id', parentCategory.id)
        .neq('id', currentCategory.id)
        .order('name', { ascending: true });

      siblings = siblingRows || [];
    } else {
      // root без детей → соседи по root
      const { data: rootSiblings } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .is('parent_id', null)
        .neq('id', currentCategory.id)
        .order('name', { ascending: true });

      siblings = rootSiblings || [];
    }

    if (parentCategory) {
      navigation.push({
        slug: parentCategory.slug,
        name: parentCategory.name,
      });
    }

    navigation.push({
      slug: currentCategory.slug,
      name: currentCategory.name,
    });

    navigation.push(
      ...siblings.map((c: Category) => ({
        slug: c.slug,
        name: c.name,
      })),
    );
  }

  return navigation;
});
