import { serverSupabaseClient } from '#supabase/server';


type QueryParams = {
  slug?: string
};

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image: string | null
};

type NavigationItem = {
  slug: string
  name: string
  image: string | null
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
      .select('id, name, slug, parent_id, image')
      .is('parent_id', null)
      .order('name', { ascending: true });

    if (topErr) {
      throw createError({ statusCode: 500, statusMessage: topErr.message });
    }

    return (topCategories || []).map((c: Category) => ({
      slug: c.slug,
      name: c.name,
      image: c.image,
    }));
  }

  // --- 2. Текущая категория ---
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, image')
    .eq('slug', String(query.slug))
    .maybeSingle();

  if (catErr) {
    throw createError({ statusCode: 500, statusMessage: catErr.message });
  }

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }

  currentCategory = category as Category;

  // --- 3. Родитель ---
  if (currentCategory.parent_id !== null) {
    const { data: parentRow } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, image')
      .eq('id', currentCategory.parent_id)
      .maybeSingle();

    if (parentRow) parentCategory = parentRow as Category;
  }

  // --- 4. Дети ---
  const { data: children } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, image')
    .eq('parent_id', currentCategory.id)
    .order('name', { ascending: true });

  if (children && children.length > 0) {
    if (parentCategory) {
      navigation.push({
        slug: parentCategory.slug,
        name: parentCategory.name,
        image: parentCategory.image,
      });
    }

    navigation.push({
      slug: currentCategory.slug,
      name: currentCategory.name,
      image: currentCategory.image,
    });

    navigation.push(
      ...children.map((c: Category) => ({
        slug: c.slug,
        name: c.name,
        image: c.image,
      })),
    );
  } else {
    // --- 5. Соседи ---
    let siblings: Category[] = [];

    if (parentCategory) {
      const { data: siblingRows } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, image')
        .eq('parent_id', parentCategory.id)
        .neq('id', currentCategory.id)
        .order('name', { ascending: true });

      siblings = siblingRows || [];
    } else {
      const { data: rootSiblings } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, image')
        .is('parent_id', null)
        .neq('id', currentCategory.id)
        .order('name', { ascending: true });

      siblings = rootSiblings || [];
    }

    if (parentCategory) {
      navigation.push({
        slug: parentCategory.slug,
        name: parentCategory.name,
        image: parentCategory.image,
      });
    }

    navigation.push({
      slug: currentCategory.slug,
      name: currentCategory.name,
      image: currentCategory.image,
    });

    navigation.push(
      ...siblings.map((c: Category) => ({
        slug: c.slug,
        name: c.name,
        image: c.image,
      })),
    );
  }

  return navigation;
});
