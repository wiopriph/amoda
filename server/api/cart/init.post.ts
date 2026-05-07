import { getCartApiContext, serializeCart } from '~~/server/utils/cart';


export default defineEventHandler(async (event) => {
  const body = await readBody<{ session_id?: string; sessionId?: string }>(event);
  const { client, cart } = await getCartApiContext(event, body?.session_id ?? body?.sessionId);

  return serializeCart(client, cart);
});
