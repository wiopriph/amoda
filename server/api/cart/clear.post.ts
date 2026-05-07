import {
  getCartApiContext,
  serializeCart,
} from '~~/server/utils/cart';


export default defineEventHandler(async (event) => {
  const body = await readBody<{ session_id?: string; sessionId?: string }>(event);
  const { client, cart } = await getCartApiContext(event, body?.session_id ?? body?.sessionId);

  const { error } = await client
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return serializeCart(client, cart);
});
