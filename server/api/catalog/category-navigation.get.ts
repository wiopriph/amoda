import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
};

export type CategoryNavigationResponse = {
  // Чип «Todos»: текущая категория (если есть дети) или родитель (если лист)
  todos: { slug: string; active: boolean } | null
  // Один уровень: дети текущей либо сёстры листа (текущая помечена active)
  items: { slug: string; name: string; active: boolean }[]
};

const CATEGORY_FIELDS = 'id, name, slug, parent_id';

export default defineEventHandler(async (event): Promise<CategoryNavigationResponse> => {
  const supabase = await serverSupabaseClient(event);
  const slug = String(getQuery(event).slug || '');

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug required' });
  }

  const { data: current, error: currentError } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle<CategoryRow>();

  if (currentError) {
    throw createError({ statusCode: 500, statusMessage: currentError.message });
  }

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }

  const { data: children, error: childrenError } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .eq('parent_id', current.id)
    .eq('active', true)
    .order('name', { ascending: true });

  if (childrenError) {
    throw createError({ statusCode: 500, statusMessage: childrenError.message });
  }

  // Есть дети: «Todos» — текущая, чипы — дети
  if (children?.length) {
    return {
      todos: { slug: current.slug, active: true },
      items: children.map(child => ({ slug: child.slug, name: child.name, active: false })),
    };
  }

  // Лист без родителя: навигации нет
  if (current.parent_id === null) {
    return { todos: null, items: [] };
  }

  // Лист: «Todos» — родитель, чипы — сёстры вместе с текущей
  const [{ data: parent }, { data: generation, error: generationError }] = await Promise.all([
    supabase
      .from('categories')
      .select(CATEGORY_FIELDS)
      .eq('id', current.parent_id)
      .eq('active', true)
      .maybeSingle<CategoryRow>(),
    supabase
      .from('categories')
      .select(CATEGORY_FIELDS)
      .eq('parent_id', current.parent_id)
      .eq('active', true)
      .order('name', { ascending: true }),
  ]);

  if (generationError) {
    throw createError({ statusCode: 500, statusMessage: generationError.message });
  }

  return {
    todos: parent ? { slug: parent.slug, active: false } : null,
    items: (generation || []).map(sibling => ({
      slug: sibling.slug,
      name: sibling.name,
      active: sibling.slug === current.slug,
    })),
  };
});
