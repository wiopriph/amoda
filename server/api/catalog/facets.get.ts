import { serverSupabaseClient } from '#supabase/server';
import { BASE_COLORS } from '#shared/constants/colors';


const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const COLOR_ORDER = BASE_COLORS.map(c => c.value);

type FacetsResponse = {
  colors: string[]
  sizes: string[]
  priceMin: number
  priceMax: number
};

export default defineEventHandler(async (event): Promise<FacetsResponse> => {
  const supabase = await serverSupabaseClient(event);
  const { slug, q } = getQuery(event) as { slug?: string; q?: string };

  let descendantIds: number[] = [];

  if (slug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', String(slug))
      .maybeSingle();

    if (category) {
      const { data: closureRows } = await supabase
        .from('category_closure')
        .select('descendant_id')
        .eq('ancestor_id', category.id);

      descendantIds = (closureRows ?? []).map((r: any) => r.descendant_id);
    }
  }

  let query = supabase
    .from('products')
    .select('variants:product_variants(color, price, sizes:product_variant_sizes(size))')
    .eq('active', true);

  if (descendantIds.length > 0) {
    query = query.in('primary_category_id', descendantIds);
  }

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const colors = new Set<string>();
  const sizes = new Set<string>();

  let priceMin = Infinity;
  let priceMax = 0;

  for (const product of data ?? []) {
    for (const variant of (product as any).variants ?? []) {
      if (variant.color) {
        colors.add(String(variant.color));
      }

      const price = Number(variant.price);

      if (Number.isFinite(price) && price > 0) {
        priceMin = Math.min(priceMin, price);
        priceMax = Math.max(priceMax, price);
      }

      for (const size of variant.sizes ?? []) {
        if (size.size) {
          sizes.add(String(size.size).trim()
            .toUpperCase());
        }
      }
    }
  }

  const sortedColors = [...colors].sort((a, b) => {
    const ai = COLOR_ORDER.indexOf(a);
    const bi = COLOR_ORDER.indexOf(b);

    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const sortedSizes = [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);

    if (ai !== -1 && bi !== -1) {
      return ai - bi;
    }

    if (ai !== -1) {
      return -1;
    }

    if (bi !== -1) {
      return 1;
    }

    return a.localeCompare(b, undefined, { numeric: true });
  });

  return {
    colors: sortedColors,
    sizes: sortedSizes,
    priceMin: priceMin === Infinity ? 0 : priceMin,
    priceMax,
  };
});
