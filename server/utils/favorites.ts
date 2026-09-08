/* eslint-disable camelcase */

type SupabaseClient = any;

export type FavoriteRow = {
  id: number
  slug: string
  title: string
  brand_name: string | null
  price: number
  image: string | null
  addedAt: string
};

const MAX_FAVORITES = 200;

const toPositiveInt = (value: unknown) => {
  const number = typeof value === 'string' ? Number(value) : value;

  return Number.isInteger(number) && Number(number) > 0 ? Number(number) : null;
};

export const normalizeProductId = (value: unknown) => {
  const id = toPositiveInt(value);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product_id' });
  }

  return id;
};

export const normalizeProductIds = (value: unknown) => {
  const list = Array.isArray(value) ? value : [];
  const ids = list.map(toPositiveInt).filter((id): id is number => Boolean(id));

  return [...new Set(ids)].slice(0, MAX_FAVORITES);
};

// Тот же формат, что у карточки в каталоге: цена и фото default-варианта (с минимальным id)
const mapProduct = (product: any, addedAt: string): FavoriteRow => {
  const variants = (product.variants || [])
    .filter((variant: any) => variant?.active !== false)
    .sort((a: any, b: any) => (a?.id ?? 0) - (b?.id ?? 0));

  const defaultVariant = variants[0] ?? null;
  const images = [...(defaultVariant?.product_variant_images || [])]
    .sort((a: any, b: any) => (a?.position ?? 0) - (b?.position ?? 0));

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand_name: product.brand?.name ?? null,
    price: defaultVariant?.price ?? 0,
    image: images[0]?.url ?? null,
    addedAt,
  };
};

export const listFavorites = async (client: SupabaseClient, userId: string): Promise<FavoriteRow[]> => {
  const { data: favorites, error } = await client
    .from('favorites')
    .select('product_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_FAVORITES);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!favorites?.length) {
    return [];
  }

  const { data: products, error: productsError } = await client
    .from('products')
    .select(`
      id,
      slug,
      title,
      brand:brands(name),
      variants:product_variants(
        id,
        price,
        active,
        product_variant_images(url, position)
      )
    `)
    .in('id', favorites.map((favorite: any) => favorite.product_id))
    .eq('active', true);

  if (productsError) {
    throw createError({ statusCode: 500, statusMessage: productsError.message });
  }

  const productsById = new Map((products || []).map((product: any) => [product.id, product]));

  // Снятые с продажи товары не показываем, но и не удаляем — вернутся вместе с товаром
  return favorites
    .map((favorite: any) => {
      const product = productsById.get(favorite.product_id);

      return product ? mapProduct(product, favorite.created_at) : null;
    })
    .filter((row: FavoriteRow | null): row is FavoriteRow => Boolean(row));
};

export const addFavorites = async (client: SupabaseClient, userId: string, productIds: number[]) => {
  if (!productIds.length) {
    return;
  }

  const { error } = await client
    .from('favorites')
    .upsert(
      productIds.map(product_id => ({ user_id: userId, product_id })),
      { onConflict: 'user_id,product_id', ignoreDuplicates: true },
    );

  if (error) {
    // 23503 — товара нет в базе; для одиночного добавления это ошибка запроса
    if (error.code === '23503') {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' });
    }

    throw createError({ statusCode: 500, statusMessage: error.message });
  }
};
