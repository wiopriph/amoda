import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type ProductImageRow = {
  url: string
  position: number | null
  alt: string | null
};

type VariantSizeRow = {
  id: number
  size: string
  stock: number | null
};

type ProductVariantRow = {
  id: number
  color: string | null
  price: number
  active: boolean
  images?: ProductImageRow[] | null
  sizes?: VariantSizeRow[] | null
};

type ProductRow = {
  id: number
  title: string
  slug: string
  brand_id: number | null
  primary_category_id: number | null
  description: string | null
  active: boolean
  badges: string[]
  product_variants?: ProductVariantRow[] | null
};

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
      badges,
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

  const product = data as ProductRow;

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    active: product.active,
    badges: product.badges ?? [],
    brand_id: product.brand_id,
    primary_category_id: product.primary_category_id,
    variants: product.product_variants?.map(v => ({
      id: v.id,
      color: v.color,
      price: v.price,
      active: v.active,
      images: v.images || [],
      sizes: v.sizes || [],
    })) || [],
  };
});
