import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
};

type VariantImageRow = {
  url: string
  position: number | null
  alt: string | null
};

type VariantSizeRow = {
  id: number
  size: string
  stock: number | null
};

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
      category:categories!products_primary_category_id_fkey (
        id, name, slug, parent_id
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

  let parentChain: CategoryRow[] = [];

  const currentCat = (productRow.category as CategoryRow | null) ?? null;

  if (currentCat) {
    const { data: ancestors, error: ancErr } = await supabase
      .from('category_closure')
      .select('depth, categories:ancestor_id ( id, name, slug, parent_id )')
      .eq('descendant_id', currentCat.id)
      .order('depth', { ascending: false });

    if (ancErr) {
      throw createError({ statusCode: 500, statusMessage: ancErr.message });
    }

    parentChain = (ancestors || [])
      .filter((r: any) => r.depth > 0)
      .map((r: any) => r.categories as CategoryRow);
  }

  const trail: CategoryRow[] = currentCat ?
    [{
      id: currentCat.id,
      name: currentCat.name,
      slug: currentCat.slug,
      parent_id: currentCat.parent_id,
    }] :
    [];

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
        [...v.sizes].sort((a, b) => String(a.size).localeCompare(String(b.size))) :
        [];

      return {
        id: v.id,
        color: v.color,
        price: v.price,
        images: imagesSorted,
        sizes: sizesSorted,
      };
    });

  const breadcrumbs = [
    {
      label: 'Página inicial',
      to: { name: 'index', params: {} },
    },
    ...categoriesTrail.map((c) => ({
      label: c.name,
      to: { name: 'category-slug', params: { slug: c.slug } },
    })),
    {
      label: productRow.title,
      to: { name: 'product-slug', params: { slug: productRow.slug } },
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
      category_id: currentCat?.id ?? null,
      variants: normalizedVariants,
      created_at: productRow.created_at,
    },
    breadcrumbs,
  };
});
