import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const { data: categories, error } = await db
    .from('categories')
    .select('slug, updated_at, created_at')
    .eq('active', true)
    .order('slug', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!categories?.length) {
    return [];
  }

  return categories.map((category) => ({
    loc: `/category/${category.slug}`,
    lastmod: category.updated_at ? new Date(category.updated_at).toISOString() : undefined,
    changefreq: 'weekly' as const,
    priority: 0.6,
  }));
});
