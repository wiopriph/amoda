import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


type ProductRow = {
  slug: string;
  created_at?: string | null;
  active?: boolean | null;
};

export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const { data, error } = await db
    .from('products')
    .select('slug, created_at, active')
    .eq('active', true);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const products: ProductRow[] = data || [];

  if (!products.length) {
    return [];
  }

  const locales = ['', 'en'];
  const CHANGEFREQ = 'weekly';
  const PRIORITY = 0.7;

  return products.flatMap((product) =>
    locales.map((locale) => {
      const prefix = locale ? `/${locale}` : '';

      return {
        loc: `${prefix}/product/${product.slug}`,
        lastmod: product.created_at ? new Date(product.created_at).toISOString() : undefined,
        changefreq: CHANGEFREQ,
        priority: PRIORITY,
      };
    }),
  );
});
