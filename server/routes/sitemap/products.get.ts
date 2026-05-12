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


  return products.map((product) => ({
    loc: `/product/${product.slug}`,
    lastmod: product.created_at ? new Date(product.created_at).toISOString() : undefined,
    changefreq: 'weekly',
    priority: 0.7,
  }));
});
