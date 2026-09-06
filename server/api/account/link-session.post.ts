import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { normalizeCartSessionId } from '~~/server/utils/cart';


// Заказы, сделанные с этого устройства до входа, становятся видны в кабинете
export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<{ session_id?: string; sessionId?: string }>(event);
  const sessionId = normalizeCartSessionId(body?.session_id ?? body?.sessionId);

  const client = await serverSupabaseServiceRole(event) as any;

  const { error: cartsError } = await client
    .from('carts')
    .update({ 'user_id': user.id })
    .eq('session_id', sessionId)
    .is('user_id', null);

  if (cartsError) {
    throw createError({ statusCode: 500, statusMessage: cartsError.message });
  }

  const { data: carts, error: listError } = await client
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .eq('user_id', user.id);

  if (listError) {
    throw createError({ statusCode: 500, statusMessage: listError.message });
  }

  const cartIds = (carts || []).map((cart: any) => cart.id);

  if (!cartIds.length) {
    return { linkedOrders: 0 };
  }

  const { data: orders, error: ordersError } = await client
    .from('orders')
    .update({ 'user_id': user.id })
    .in('cart_id', cartIds)
    .is('user_id', null)
    .select('id');

  if (ordersError) {
    throw createError({ statusCode: 500, statusMessage: ordersError.message });
  }

  return { linkedOrders: (orders || []).length };
});
