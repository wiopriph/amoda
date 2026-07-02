import { serverSupabaseClient } from '#supabase/server';
import type { CatalogBreadcrumb as Breadcrumb, CatalogCategory as Category, CatalogListResponse } from '#shared/types/catalog';


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

type CategoryClosureRow = {
  descendant_id: number
};

type CategoryAncestorRow = {
  depth: number
  categories: Category
};

type BrandRow = {
  name: string
};

type VariantImageRow = {
  url: string
  position: number | null
};

type VariantSizeRow = {
  id: number
  size: string
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
  brand_id: number | null
  primary_category_id: number | null
  brand: BrandRow | null
  variants?: ProductVariantRow[] | null
};

export default defineEventHandler(async (event): Promise<CatalogListResponse> => {
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
      .select('id, name, slug, parent_id, image, seo_title, seo_description, seo_content, h1_override')
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

    descendantIds = ((closureRows || []) as CategoryClosureRow[]).map(r => r.descendant_id);
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

    const chain = ((ancestors || []) as CategoryAncestorRow[])
      .filter(x => x.depth > 0)
      .map(r => r.categories)
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

  // !inner required so variant-level filters (color, price, size) actually
  // exclude products instead of just trimming the nested arrays
  const hasVariantFilter = Boolean(query.color || query.min_price || query.max_price || query.size);
  const variantJoin = hasVariantFilter ? 'product_variants!inner' : 'product_variants';
  const sizeJoin = query.size ? 'product_variant_sizes!inner' : 'product_variant_sizes';

  let productsQuery = supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      badges,
      brand_id,
      primary_category_id,
      brand:brands(name),
      variants:${variantJoin}(
        id,
        color,
        price,
        product_variant_images(url, position),
        sizes:${sizeJoin}(id, size)
      )
    `, { count: 'exact' })
    .eq('active', true)
    // only the cover image per variant — the card needs one, not the whole gallery
    .order('position', { referencedTable: 'variants.product_variant_images', ascending: true })
    .limit(1, { referencedTable: 'variants.product_variant_images' });

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

  if (query.size) {
    productsQuery = productsQuery.ilike('product_variants.product_variant_sizes.size', String(query.size));
  }

  if (query.min_price) {
    productsQuery = productsQuery.gte('product_variants.price', Number(query.min_price));
  }

  if (query.max_price) {
    productsQuery = productsQuery.lte('product_variants.price', Number(query.max_price));
  }

  // PostgREST can't order parent rows by a one-to-many embedded column,
  // so price sorting is done in JS over the full (small) result set below
  const isPriceSort = query.sort === 'price_asc' || query.sort === 'price_desc';

  productsQuery = productsQuery.order('id', { ascending: false });

  if (!isPriceSort) {
    productsQuery = productsQuery.range(rangeFrom, rangeTo);
  } else {
    productsQuery = productsQuery.limit(1000);
  }

  const { data: productRows, count: totalCount, error: listError } = await productsQuery;

  if (listError) {
    throw createError({ statusCode: 500, statusMessage: listError.message });
  }

  const items = ((productRows || []) as ProductRow[]).map((product) => {
    const variants = Array.isArray(product.variants) ? product.variants.slice() : [];

    // детерминируем default variant:
    // 1) если сортировка по цене — берём вариант с min/max ценой
    // 2) иначе — по id
    let defaultVariant: ProductVariantRow | null = null;

    if (variants.length) {
      if (query.sort === 'price_asc') {
        variants.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
      } else if (query.sort === 'price_desc') {
        variants.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
      } else {
        variants.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));
      }

      defaultVariant = variants[0] ?? null;
    }

    const sizes = Array.isArray(defaultVariant?.sizes) ? defaultVariant.sizes.slice() : [];

    sizes.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));

    const defaultSize = sizes[0] ?? null;

    const imgs = Array.isArray(defaultVariant?.product_variant_images) ?
      defaultVariant.product_variant_images.slice() :
      [];

    imgs.sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));

    const imageUrl = imgs[0]?.url ?? null;

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      badges: product.badges ?? [],
      primary_category_id: product.primary_category_id,
      brand_id: product.brand_id ?? null,
      brand_name: product.brand?.name ?? null,

      // “витринная” цена — цена default варианта
      price: defaultVariant?.price ?? 0,

      // defaults для GA4
      default_variant_id: defaultVariant?.id ?? null,
      default_size_id: defaultSize?.id ?? null,
      default_variant_color: defaultVariant?.color ?? null,
      default_size_label: defaultSize?.size ?? null,

      // чтоб карточка была самодостаточной
      image: imageUrl,
    };
  });

  let pageItems = items;

  if (isPriceSort) {
    items.sort((a, b) => query.sort === 'price_asc' ? a.price - b.price : b.price - a.price);
    pageItems = items.slice(rangeFrom, rangeTo + 1);
  }

  return {
    breadcrumbs,
    category: currentCategory,
    items: pageItems,
    total: totalCount || 0,
    page,
    limit,
  };
});
