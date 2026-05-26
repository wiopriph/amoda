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

type CategoryClosureRow = {
  descendant_id: number
};

type CategoryAncestorRow = {
  depth: number
  categories: CategoryRow
};

type BrandRow = {
  id?: number
  name: string
  slug?: string
};

type ProductVariantRow = {
  id: number
  color: string | null
  price: number
  active?: boolean | null
  images?: VariantImageRow[] | null
  sizes?: VariantSizeRow[] | null
};

type ProductRow = {
  id: number
  title: string
  slug: string
  description: string | null
  active: boolean | null
  badges: string[]
  created_at: string | null
  brand: BrandRow | null
  category: CategoryRow | null
  variants?: ProductVariantRow[] | null
};

type RecommendedVariantRow = {
  id: number
  color: string | null
  price: number | null
  product_variant_images?: VariantImageRow[] | null
};

type RecommendedProductRow = {
  id: number
  slug: string
  title: string
  badges: string[]
  primary_category_id: number | null
  brand: Pick<BrandRow, 'name'> | null
  variants?: RecommendedVariantRow[] | null
};

type RecommendedProduct = {
  id: number
  slug: string
  title: string
  badges: string[]
  primary_category_id: number | null
  brand_name: string | null
  price: number
  variant_id: number | null
  color: string | null
  images: VariantImageRow[]
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

  const product = productRow as ProductRow;

  let parentChain: CategoryRow[] = [];

  const currentCat = product.category ?? null;

  if (currentCat) {
    const { data: ancestors, error: ancErr } = await supabase
      .from('category_closure')
      .select('depth, categories:ancestor_id ( id, name, slug, parent_id )')
      .eq('descendant_id', currentCat.id)
      .order('depth', { ascending: false });

    if (ancErr) {
      throw createError({ statusCode: 500, statusMessage: ancErr.message });
    }

    parentChain = ((ancestors || []) as CategoryAncestorRow[])
      .filter(r => r.depth > 0)
      .map(r => r.categories);
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

  const normalizedVariants = (product.variants || [])
    .filter(v => v.active !== false)
    .map((v) => {
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
      label: product.title,
      to: { name: 'product-slug', params: { slug: product.slug } },
    },
  ];

  let recommendations: RecommendedProduct[] = [];

  if (currentCat?.id) {
    const { data: desc, error: descErr } = await supabase
      .from('category_closure')
      .select('descendant_id')
      .eq('ancestor_id', currentCat.id);

    if (descErr) {
      throw createError({ statusCode: 500, statusMessage: descErr.message });
    }

    const ids = ((desc || []) as CategoryClosureRow[]).map(r => r.descendant_id);

    const { data: recsA, error: recErrA } = await supabase
      .from('products')
      .select(`
        id, slug, title, badges, primary_category_id,
        brand:brands(name),
        variants:product_variants(
          id, color, price,
          product_variant_images(url, position)
        )
      `)
      .in('primary_category_id', ids)
      .neq('id', product.id)
      .eq('active', true)
      .limit(10);

    if (recErrA) {
      throw createError({ statusCode: 500, statusMessage: recErrA.message });
    }

    let recs = (recsA || []) as RecommendedProductRow[];

    if (!recs.length && currentCat.parent_id) {
      const { data: recsB, error: recErrB } = await supabase
        .from('products')
        .select(`
          id, slug, title, badges, primary_category_id,
          brand:brands(name),
          variants:product_variants(
            id, color, price,
            product_variant_images(url, position)
          )
        `)
        .eq('primary_category_id', currentCat.parent_id)
        .neq('id', product.id)
        .eq('active', true)
        .limit(10);

      if (recErrB) {
        throw createError({ statusCode: 500, statusMessage: recErrB.message });
      }

      recs = (recsB || []) as RecommendedProductRow[];
    }

    recommendations = recs.map((p) => {
      const v = Array.isArray(p.variants) ? p.variants[0] : null;
      const imgs = Array.isArray(v?.product_variant_images) ?
        [...v.product_variant_images].sort(
          (a, b) => (a?.position ?? 0) - (b?.position ?? 0),
        ) :
        [];

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        badges: p.badges ?? [],
        primary_category_id: p.primary_category_id,
        brand_name: p.brand?.name ?? null,
        price: v?.price ?? 0,
        variant_id: v?.id ?? null,
        color: v?.color ?? null,
        images: imgs,
      };
    });
  }

  return {
    product: {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      active: product.active,
      badges: product.badges ?? [],
      brand_id: product.brand?.id ?? null,
      brand_name: product.brand?.name ?? null,
      primary_category_id: currentCat?.id ?? null,
      variants: normalizedVariants,
      created_at: product.created_at,
    },
    breadcrumbs,
    recommendations,
  };
});
