import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


type ProductRow = {
  slug: string;
  'updated_at'?: string | null;
  'created_at'?: string | null;
  active?: boolean | null;
};

export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const { data, error } = await db
    .from('products')
    .select('slug, updated_at, created_at, active')
    .eq('active', true);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const products: ProductRow[] = data || [];

  if (!products.length) {
    return [];
  }


  return products.map((product) => {
    const lastmod = product['updated_at'] || product['created_at'];

    return {
      loc: `/product/${product.slug}`,
      lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
      changefreq: 'weekly',
      priority: 0.7,
    };
  });
});
