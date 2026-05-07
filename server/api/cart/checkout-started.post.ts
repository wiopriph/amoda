/* eslint-disable camelcase */
import { getCartApiContext, serializeCart } from '~~/server/utils/cart';


export default defineEventHandler(async (event) => {
  const body = await readBody<{
    session_id?: string
    sessionId?: string
    contact?: unknown
  }>(event);

  const { client, cart } = await getCartApiContext(event, body?.session_id ?? body?.sessionId);

  const { data, error } = await client
    .from('carts')
    .update({
      status: 'CHECKOUT',
      checkout_started_at: new Date().toISOString(),
      contact_snapshot: body?.contact ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cart.id)
    .select('*')
    .single();

  if (error || !data) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to start checkout',
    });
  }

  return serializeCart(client, data);
});
