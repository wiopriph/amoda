import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type ProductVariantImageRow = {
  url: string | null
};

type ProductVariantRow = {
  id: number
  product_variant_images?: ProductVariantImageRow[] | null
};

type ProductRow = {
  id: number
  product_variants?: ProductVariantRow[] | null
};

const getProductStoragePath = (imageUrl: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith('products/')) {
    return imageUrl;
  }

  try {
    const pathName = new URL(imageUrl).pathname;
    const marker = '/storage/v1/object/public/products/';
    const markerIndex = pathName.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(pathName.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
};

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<{ id?: number | string }>(event);

  if (!body.id) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID required' });
  }

  const { data: product, error: productError } = await client
    .from('products')
    .select(`
      id,
      product_variants (
        id,
        product_variant_images ( url )
      )
    `)
    .eq('id', body.id)
    .maybeSingle();

  if (productError) {
    throw createError({ statusCode: 500, statusMessage: productError.message });
  }

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' });
  }

  const productRow = product as ProductRow;
  const variantIds = (productRow.product_variants || []).map(variant => variant.id);
  const storagePaths = [...new Set(
    (productRow.product_variants || [])
      .flatMap(variant => variant.product_variant_images || [])
      .map(image => getProductStoragePath(image.url))
      .filter((path): path is string => Boolean(path)),
  )];

  const { data: orderItem, error: orderItemError } = await client
    .from('order_items')
    .select('id')
    .eq('product_id', productRow.id)
    .limit(1)
    .maybeSingle();

  if (orderItemError) {
    throw createError({ statusCode: 500, statusMessage: orderItemError.message });
  }

  if (orderItem) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Product has orders and cannot be deleted. Deactivate it instead.',
    });
  }

  if (variantIds.length) {
    const { error: cartItemsDeleteError } = await client
      .from('cart_items')
      .delete()
      .in('variant_id', variantIds);

    if (cartItemsDeleteError) {
      throw createError({ statusCode: 500, statusMessage: cartItemsDeleteError.message });
    }
  }

  const { data: deletedRows, error: deleteError } = await client
    .from('products')
    .delete()
    .eq('id', productRow.id)
    .select('id');

  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message });
  }

  if (!deletedRows?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' });
  }

  if (!storagePaths.length) {
    return {
      deleted: true,
      removedFiles: 0,
    };
  }

  const { error: storageError } = await client
    .storage
    .from('products')
    .remove(storagePaths);

  return {
    deleted: true,
    removedFiles: storageError ? 0 : storagePaths.length,
    storageError: storageError?.message,
  };
});
