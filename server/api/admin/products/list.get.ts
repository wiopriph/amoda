import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const q = getQuery(event) as { page?: string | number; limit?: string | number; q?: string };

  const page = Math.max(1, Number(q.page || 1));
  const limit = Math.min(100, Math.max(1, Number(q.limit || 15)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let req = client
    .from('products')
    .select(`
      id,
      title,
      slug,
      active,
      brands ( id, name ),
      product_variants (
        id,
        color,
        price,
        active,
        product_variant_images ( url ),
        product_variant_sizes ( id, size, stock )
      )
    `, { count: 'exact' })
    .order('id', { ascending: false });

  const search = (q.q || '').trim();

  if (search) {
    req = req.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error, count } = await req.range(from, to);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const items = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    active: p.active,
    brand: p.brands,
    variants: (p.product_variants || []).map((v: any) => ({
      id: v.id,
      color: v.color,
      price: v.price,
      active: v.active,
      images: v.product_variant_images || [],
      sizes: (v.product_variant_sizes || []).map((s: any) => ({
        id: s.id,
        size: s.size,
        stock: s.stock ?? null,
      })),
    })),
  }));

  return { items, total: count ?? 0, page, limit };
});
