import { serverSupabaseServiceRole } from '#supabase/server';
import { assertExtension } from '~~/server/utils/assertExtension';


export default defineEventHandler(async (event) => {
  assertExtension(event);

  const client = await serverSupabaseServiceRole(event);
  const { q } = getQuery(event) as { q?: string };

  let query = client
    .from('products')
    .select('id, title, slug, ms_product_id, product_variants(id, color, product_variant_images(url, position))')
    .order('title')
    .limit(20);

  if (q?.trim()) {
    query = query.ilike('title', `%${q.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return (data ?? []).map((p: any) => {
    const variant = p.product_variants?.[0];
    const images: any[] = variant?.product_variant_images ?? [];
    const sorted = images.slice().sort((a: any, b: any) => (a.position ?? 99) - (b.position ?? 99));

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      msProductId: p.ms_product_id ?? null,
      imageUrl: sorted[0]?.url ?? null,
    };
  });
});
