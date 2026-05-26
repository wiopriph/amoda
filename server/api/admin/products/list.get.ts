import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type QueryParams = {
  page?: string | number
  limit?: string | number
  q?: string
};

type BrandRow = {
  id: number
  name: string
};

type ProductVariantImageRow = {
  url: string
};

type ProductVariantSizeRow = {
  id: number
  size: string
  stock: number | null
};

type ProductVariantRow = {
  id: number
  color: string | null
  price: number | null
  active: boolean
  product_variant_images?: ProductVariantImageRow[] | null
  product_variant_sizes?: ProductVariantSizeRow[] | null
};

type ProductRow = {
  id: number
  title: string
  slug: string
  active: boolean
  badges: string[]
  brands: BrandRow | null
  product_variants?: ProductVariantRow[] | null
};

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const q = getQuery(event) as QueryParams;

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
      badges,
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

  const items = ((data || []) as ProductRow[]).map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    active: p.active,
    badges: p.badges ?? [],
    brand: p.brands,
    variants: (p.product_variants || []).map(v => ({
      id: v.id,
      color: v.color,
      price: v.price,
      active: v.active,
      images: v.product_variant_images || [],
      sizes: (v.product_variant_sizes || []).map(s => ({
        id: s.id,
        size: s.size,
        stock: s.stock ?? null,
      })),
    })),
  }));

  return { items, total: count ?? 0, page, limit };
});
