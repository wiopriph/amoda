import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


type ProductRow = {
  slug: string;
  'updated_at'?: string | null;
  'created_at'?: string | null;
  active?: boolean | null;
};

// PostgREST молча режет ответ на 1000 строк — выбираем постранично
const PAGE_SIZE = 1000;

export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const products: ProductRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from('products')
      .select('slug, updated_at, created_at, active')
      .eq('active', true)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    products.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

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
