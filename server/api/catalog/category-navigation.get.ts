import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image: string | null
};

export type CategoryNavigationResponse = {
  // Один уровень «вглубь/вбок»: дети текущей либо сёстры листа (текущая помечена active).
  // Вверх по дереву ведут хлебные крошки — здесь этого направления нет
  items: { slug: string; name: string; image: string | null; active: boolean }[]
};

const CATEGORY_FIELDS = 'id, name, slug, parent_id, image';

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

  if (children?.length) {
    return {
      items: children.map(child => ({ slug: child.slug, name: child.name, image: child.image, active: false })),
    };
  }

  if (current.parent_id === null) {
    return { items: [] };
  }

  const { data: generation, error: generationError } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .eq('parent_id', current.parent_id)
    .eq('active', true)
    .order('name', { ascending: true });

  if (generationError) {
    throw createError({ statusCode: 500, statusMessage: generationError.message });
  }

  return {
    items: (generation || []).map(sibling => ({
      slug: sibling.slug,
      name: sibling.name,
      image: sibling.image,
      active: sibling.slug === current.slug,
    })),
  };
});
