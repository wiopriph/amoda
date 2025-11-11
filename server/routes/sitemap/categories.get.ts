import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const { data: categories, error } = await db
    .from('categories')
    .select('id, slug')
    .eq('active', true)
    .order('slug', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!categories?.length) return [];

  const locales: string[] = ['', 'en'];
  const CHANGEFREQ = 'weekly' as const;
  const PRIORITY = 0.6 as const;

  return categories.flatMap((category) =>
    locales.map((locale) => {
      const prefix = locale ? `/${locale}` : '';

      return {
        loc: `${prefix}/category/${category.slug}`,
        changefreq: CHANGEFREQ,
        priority: PRIORITY,
      };
    }),
  );
});
