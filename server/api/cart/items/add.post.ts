import {
  addOrUpdateCartItem,
  getCartApiContext,
  normalizeCartItemInput,
  serializeCart,
} from '~~/server/utils/cart';


export default defineEventHandler(async (event) => {
  const body = await readBody<{
    session_id?: string
    sessionId?: string
    variant_id?: unknown
    variantId?: unknown
    product_variant_size_id?: unknown
    productVariantSizeId?: unknown
    size_id?: unknown
    sizeId?: unknown
    qty?: unknown
  }>(event);

  const { client, cart } = await getCartApiContext(event, body?.session_id ?? body?.sessionId);
  const item = normalizeCartItemInput(body || {});

  await addOrUpdateCartItem(client, cart.id, item.variantId, item.sizeId, item.qty, 'add');

  return serializeCart(client, cart);
});
