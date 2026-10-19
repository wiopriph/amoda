/* eslint-disable camelcase */
import { serverSupabaseClient } from '#supabase/server';
import { withAutoBadges } from '~~/app/utils/productBadges';
import type { BlogCategoryPreview } from '#shared/types/blog';


type QueryParams = {
  slug?: string
  limit?: string | number
};

type CategoryClosureRow = {
  descendant_id: number
};

type VariantImageRow = {
  url: string
  position: number | null
};

type VariantSizeRow = {
  id: number
  size: string
  stock: number | null
};

type ProductVariantRow = {
  id: number
  color: string | null
  price: number | null
  product_variant_images?: VariantImageRow[] | null
  sizes?: VariantSizeRow[] | null
};

type ProductRow = {
  id: number
  title: string
  slug: string
  badges: string[]
  created_at: string | null
  brand_id: number | null
  primary_category_id: number | null
  min_price: number | null
  max_price: number | null
  brand: { name: string } | null
  variants?: ProductVariantRow[] | null
};

// Данные для MDC-компонентов блога (::category-cta, ::product-grid):
// категория + её товары в наличии (есть размер со stock > 0) + диапазон цен
export default defineEventHandler(async (event): Promise<BlogCategoryPreview> => {
  const supabase = await serverSupabaseClient(event);
  const query = getQuery(event) as QueryParams;

  const slug = String(query.slug || '').trim();

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug is required' });
  }

  const limit = Math.min(Math.max(1, Number(query.limit || 4)), 24);

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug, image')
    .eq('slug', slug)
    .maybeSingle();

  if (categoryError) {
    throw createError({ statusCode: 500, statusMessage: categoryError.message });
  }

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }

  const { data: closureRows, error: closureError } = await supabase
    .from('category_closure')
    .select('descendant_id')
    .eq('ancestor_id', category.id);

  if (closureError) {
    throw createError({ statusCode: 500, statusMessage: closureError.message });
  }

  const descendantIds = ((closureRows || []) as CategoryClosureRow[]).map(row => row.descendant_id);

  const { data: productRows, count: totalCount, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      badges,
      created_at,
      brand_id,
      primary_category_id,
      min_price,
      max_price,
      brand:brands(name),
      variants:product_variants!inner(
        id,
        color,
        price,
        product_variant_images(url, position),
        sizes:product_variant_sizes!inner(id, size, stock)
      )
    `, { count: 'exact' })
    .eq('active', true)
    .in('primary_category_id', descendantIds.length ? descendantIds : [category.id])
    .gt('product_variants.product_variant_sizes.stock', 0)
    .order('position', { referencedTable: 'variants.product_variant_images', ascending: true })
    .limit(1, { referencedTable: 'variants.product_variant_images' })
    .order('id', { ascending: false })
    .range(0, limit - 1);

  if (productsError) {
    throw createError({ statusCode: 500, statusMessage: productsError.message });
  }

  const items = ((productRows || []) as unknown as ProductRow[]).map((product) => {
    const variants = Array.isArray(product.variants) ? product.variants.slice() : [];

    variants.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));

    const defaultVariant = variants[0] ?? null;
    const sizes = Array.isArray(defaultVariant?.sizes) ? defaultVariant.sizes.slice() : [];

    sizes.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));

    const defaultSize = sizes[0] ?? null;

    const imgs = Array.isArray(defaultVariant?.product_variant_images) ?
      defaultVariant.product_variant_images.slice() :
      [];

    imgs.sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      badges: withAutoBadges(product.badges, product.created_at),
      primary_category_id: product.primary_category_id,
      brand_id: product.brand_id ?? null,
      brand_name: product.brand?.name ?? null,
      price: defaultVariant?.price ?? 0,
      default_variant_id: defaultVariant?.id ?? null,
      default_size_id: defaultSize?.id ?? null,
      default_variant_color: defaultVariant?.color ?? null,
      default_size_label: defaultSize?.size ?? null,
      image: imgs[0]?.url ?? null,
    };
  });

  const minPrices = ((productRows || []) as unknown as ProductRow[])
    .map(product => product.min_price)
    .filter((price): price is number => typeof price === 'number' && price > 0);

  const maxPrices = ((productRows || []) as unknown as ProductRow[])
    .map(product => product.max_price)
    .filter((price): price is number => typeof price === 'number' && price > 0);

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image ?? null,
    },
    items,
    total: totalCount || 0,
    priceMin: minPrices.length ? Math.min(...minPrices) : null,
    priceMax: maxPrices.length ? Math.max(...maxPrices) : null,
  };
});
