import { serverSupabaseClient } from '#supabase/server';


type VariantImage = { url: string; position: number | null };
type Variant = {
  id: number
  color: string | null
  price: number
  product_variant_images?: VariantImage[]
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { slug } = getQuery(event) as { slug?: string };

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product slug' });
  }

  const { data: product, error: productErr } = await supabase
    .from('products')
    .select('id, primary_category_id, active')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (productErr) {
    throw createError({ statusCode: 500, statusMessage: productErr.message });
  }

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' });
  }

  const categoryId = product.primary_category_id;

  const { data: descendants, error: descErr } = await supabase
    .from('category_closure')
    .select('descendant_id')
    .eq('ancestor_id', categoryId);

  if (descErr) {
    throw createError({ statusCode: 500, statusMessage: descErr.message });
  }

  const categoryIds = (descendants || []).map((r) => r.descendant_id);

  let { data: recs, error: recErr } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      title,
      primary_category_id,
      brand:brands(name),
      variants:product_variants(
        id, color, price,
        product_variant_images(url, position)
      )
    `)
    .in('primary_category_id', categoryIds)
    .neq('id', product.id)
    .eq('active', true)
    .limit(10);

  if (recErr) {
    throw createError({ statusCode: 500, statusMessage: recErr.message });
  }

  if (!recs?.length) {
    const { data: parentCat } = await supabase
      .from('categories')
      .select('parent_id')
      .eq('id', categoryId)
      .maybeSingle();

    if (parentCat?.parent_id) {
      const { data: fromParent } = await supabase
        .from('products')
        .select(`
          id,
          slug,
          title,
          primary_category_id,
          brand:brands(name),
          variants:product_variants(
            id, color, price,
            product_variant_images(url, position)
          )
        `)
        .eq('primary_category_id', parentCat.parent_id)
        .neq('id', product.id)
        .eq('active', true)
        .limit(10);

      recs = fromParent;
    }
  }

  const items = (recs || []).map((product: any) => {
    const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
    const sortedImages = Array.isArray(firstVariant?.product_variant_images) ?
      [...firstVariant.product_variant_images].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)) :
      [];

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      primary_category_id: product.primary_category_id,
      brand_name: product.brand?.name ?? null,
      price: firstVariant?.price ?? 0,
      variant_id: firstVariant?.id ?? null,
      color: firstVariant?.color ?? null,
      images: sortedImages,
    };
  });

  return { items };
});
