import { serverSupabaseClient } from '#supabase/server';


type QueryParams = {
  q?: string
  slug?: string
  brand_id?: string | number
  brand_slug?: string
  size?: string
  color?: string
  min_price?: string | number
  max_price?: string | number
  page?: string | number
  limit?: string | number
  sort?: 'price_asc' | 'price_desc' | 'new'
};

type Breadcrumb = {
  label: string
  to: { name: string; params: Record<string, string> }
};

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const query = getQuery(event) as QueryParams;

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(Number(query.limit || 24), 100);
  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  let currentCategory: Category | null = null;
  let descendantIds: number[] = [];

  if (query.slug) {
    const { data: category, error: catErr } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('slug', String(query.slug))
      .maybeSingle();

    if (catErr) {
      throw createError({ statusCode: 500, statusMessage: catErr.message });
    }

    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' });
    }

    currentCategory = category as Category;

    const { data: closureRows, error: closureErr } = await supabase
      .from('category_closure')
      .select('descendant_id')
      .eq('ancestor_id', category.id);

    if (closureErr) {
      throw createError({ statusCode: 500, statusMessage: closureErr.message });
    }

    descendantIds = (closureRows || []).map((r: any) => r.descendant_id);
  }

  const breadcrumbs: Breadcrumb[] = [
    { label: 'Página inicial', to: { name: 'index', params: {} } },
  ];

  if (currentCategory) {
    const { data: ancestors, error: ancErr } = await supabase
      .from('category_closure')
      .select('depth, categories:ancestor_id ( id, name, slug )')
      .eq('descendant_id', currentCategory.id)
      .order('depth', { ascending: true });

    if (ancErr) {
      throw createError({ statusCode: 500, statusMessage: ancErr.message });
    }

    const chain = (ancestors || [])
      .filter((x: any) => x.depth > 0)
      .map((r: any) => r.categories as Category)
      .reverse();

    for (const c of chain) {
      breadcrumbs.push({
        label: c.name,
        to: { name: 'category-slug', params: { slug: c.slug } },
      });
    }

    breadcrumbs.push({
      label: currentCategory.name,
      to: { name: 'category-slug', params: { slug: currentCategory.slug } },
    });
  }

  let productsQuery = supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      brand_id,
      primary_category_id,
      brand:brands(name),
      variants:product_variants(
        id,
        color,
        price,
        product_variant_images(url, position)
      )
    `,
    { count: 'exact' },
    )
    .eq('active', true);

  if (descendantIds.length > 0) {
    productsQuery = productsQuery.in('primary_category_id', descendantIds);
  }

  if (query.q) {
    productsQuery = productsQuery.ilike('title', `%${query.q}%`);
  }

  if (query.brand_id) {
    productsQuery = productsQuery.eq('brand_id', query.brand_id);
  } else if (query.brand_slug) {
    const { data: brandRow } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', String(query.brand_slug))
      .maybeSingle();

    if (brandRow && brandRow.id) {
      productsQuery = productsQuery.eq('brand_id', brandRow.id);
    }
  }

  if (query.color) {
    productsQuery = productsQuery.eq('product_variants.color', query.color);
  }

  if (query.min_price) {
    productsQuery = productsQuery.gte('product_variants.price', Number(query.min_price));
  }

  if (query.max_price) {
    productsQuery = productsQuery.lte('product_variants.price', Number(query.max_price));
  }

  switch (query.sort) {
    case 'price_asc':
      productsQuery = productsQuery.order('product_variants.price', { ascending: true });
      break;
    case 'price_desc':
      productsQuery = productsQuery.order('product_variants.price', { ascending: false });
      break;
    case 'new':
      productsQuery = productsQuery.order('id', { ascending: false });
      break;
    default:
      productsQuery = productsQuery.order('id', { ascending: true });
      break;
  }

  productsQuery = productsQuery.range(rangeFrom, rangeTo);

  const { data: productRows, count: totalCount, error: listError } = await productsQuery;

  if (listError) {
    throw createError({ statusCode: 500, statusMessage: listError.message });
  }

  const items = (productRows || []).map((product: any) => {
    const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
    const sortedImages = Array.isArray(firstVariant?.product_variant_images) ?
      firstVariant.product_variant_images.sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)) :
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

  return {
    breadcrumbs,
    category: currentCategory,
    items,
    total: totalCount || 0,
    page,
    limit,
  };
});
