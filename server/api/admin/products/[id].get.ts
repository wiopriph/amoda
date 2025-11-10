import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const id = Number(getRouterParam(event, 'id'));

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID required' });
  }

  const { data, error } = await client
    .from('products')
    .select(`
      id,
      title,
      slug,
      brand_id,
      primary_category_id,
      description,
      active,
      brand:brands ( id, name, slug ),
      primary_category:categories!products_primary_category_id_fkey ( id, name, slug, parent_id ),
      product_variants:product_variants (
        id, color, price, active,
        images:product_variant_images!product_variant_images_variant_id_fkey ( url, position, alt ),
        sizes:product_variant_sizes!product_variant_sizes_variant_id_fkey ( id, size, stock )
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' });
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    active: data.active,
    brand_id: data.brand_id,
    primary_category_id: data.primary_category_id,
    variants: data.product_variants?.map((v: any) => ({
      id: v.id,
      color: v.color,
      price: v.price,
      active: v.active,
      images: v.images || [],
      sizes: v.sizes || [],
    })) || [],
  };
});
