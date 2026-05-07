import {
  getCartApiContext,
  serializeCart,
} from '~~/server/utils/cart';


const toPositiveInt = (value: unknown, field: string) => {
  const number = typeof value === 'string' ? Number(value) : value;

  if (!Number.isInteger(number) || Number(number) <= 0) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` });
  }

  return Number(number);
};

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    session_id?: string
    sessionId?: string
    id?: unknown
    variant_id?: unknown
    variantId?: unknown
    product_variant_size_id?: unknown
    productVariantSizeId?: unknown
    size_id?: unknown
    sizeId?: unknown
  }>(event);

  const { client, cart } = await getCartApiContext(event, body?.session_id ?? body?.sessionId);
  const itemId = body?.id == null ? null : toPositiveInt(body.id, 'id');
  const variantId = body?.variant_id == null && body?.variantId == null ?
    null :
    toPositiveInt(body.variant_id ?? body.variantId, 'variant_id');
  const sizeId = body?.product_variant_size_id == null && body?.productVariantSizeId == null && body?.size_id == null && body?.sizeId == null ?
    null :
    toPositiveInt(
      body.product_variant_size_id ?? body.productVariantSizeId ?? body.size_id ?? body.sizeId,
      'product_variant_size_id',
    );

  if (!itemId && (!variantId || !sizeId)) {
    throw createError({ statusCode: 400, statusMessage: 'Item id or variant/size required' });
  }

  let query = client
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id);

  query = itemId ?
    query.eq('id', itemId) :
    query.eq('variant_id', variantId).eq('product_variant_size_id', sizeId);

  const { error } = await query;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return serializeCart(client, cart);
});
