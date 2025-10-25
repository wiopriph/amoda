import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  gender?: { code: string }
}

type VariantImageRow = {
  url: string;
  position: number | null;
  alt: string | null
}

type VariantSizeRow = {
  id: number;
  size: string;
  stock: number | null
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { slug } = getQuery(event) as { slug?: string };

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' });
  }

  const { data: productRow, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands ( id, name, slug ),
      primary_category:categories!products_primary_category_id_fkey (
        id, name, slug, parent_id,
        gender:genders ( code )
      ),
      variants:product_variants (
        id, color, price, active,
        images:product_variant_images!product_variant_images_variant_id_fkey ( url, position, alt ),
        sizes:product_variant_sizes!product_variant_sizes_variant_id_fkey ( id, size, stock )
      )
    `)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (productError) {
    throw createError({ statusCode: 500, statusMessage: productError.message });
  }

  if (!productRow) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }

  const parentChain: CategoryRow[] = [];

  let cursor: CategoryRow | null = productRow.primary_category as CategoryRow | null;

  while (cursor?.parent_id) {
    const { data: parentCategory, error: parentError } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('id', cursor.parent_id)
      .maybeSingle();

    if (parentError) {
      throw createError({ statusCode: 500, statusMessage: parentError.message });
    }

    if (!parentCategory) {
      break;
    }

    parentChain.unshift(parentCategory as CategoryRow);
    cursor = parentCategory as CategoryRow;
  }

  const trail: CategoryRow[] = [];

  if (productRow.primary_category) {
    trail.push({
      id: productRow.primary_category.id,
      name: productRow.primary_category.name,
      slug: productRow.primary_category.slug,
      parent_id: productRow.primary_category.parent_id,
      gender: productRow.primary_category.gender,
    });
  }

  const categoriesTrail = [...parentChain, ...trail];

  const normalizedVariants = (productRow.variants || [])
    .filter((v: any) => v.active !== false)
    .map((v: {
      id: number
      color: string | null
      price: number
      images?: VariantImageRow[] | null
      sizes?: VariantSizeRow[] | null
    }) => {
      const imagesSorted = Array.isArray(v.images) ?
        [...v.images].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)) :
        [];
      const sizesSorted = Array.isArray(v.sizes) ?
        [...v.sizes].sort((a, b) => String(a.size)
          .localeCompare(String(b.size))) :
        [];

      return {
        id: v.id,
        color: v.color,
        price: v.price,
        images: imagesSorted,
        sizes: sizesSorted,
      };
    });

  const genderCode = (productRow.primary_category as CategoryRow | null)?.gender?.code || 'women';
  const breadcrumbs = [
    {
      label: genderCode,
      to: {
        name: 'gender',
        params: { gender: genderCode },
      },
    },
    ...categoriesTrail.map(c => ({
      label: c.name,
      to: {
        name: 'gender-category',
        params: { gender: genderCode, category: c.slug },
      },
    })),
    {
      label: productRow.title,
      to: {
        name: 'product-slug',
        params: { slug: productRow.slug },
      },
    },
  ];

  return {
    product: {
      id: productRow.id,
      title: productRow.title,
      slug: productRow.slug,
      description: productRow.description,
      active: productRow.active,
      brand_id: productRow.brand?.id ?? null,
      brand_name: productRow.brand?.name ?? null,
      primary_category_id: productRow.primary_category?.id ?? null,
      variants: normalizedVariants,
      created_at: productRow.created_at,
    },
    breadcrumbs,
  };
});
