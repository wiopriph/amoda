import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  slug: string;
  'updated_at'?: string | null;
  'created_at'?: string | null;
};

// PostgREST молча режет ответ на 1000 строк — выбираем постранично
const PAGE_SIZE = 1000;

export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const categories: CategoryRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from('categories')
      .select('slug, updated_at, created_at')
      .eq('active', true)
      .order('slug', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    categories.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

  if (!categories.length) {
    return [];
  }

  return categories.map((category) => ({
    loc: `/category/${category.slug}`,
    lastmod: category.updated_at ? new Date(category.updated_at).toISOString() : undefined,
    changefreq: 'weekly' as const,
    priority: 0.6,
  }));
});
