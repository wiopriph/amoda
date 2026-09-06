import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { fetchOrderByNumber, toPublicOrder } from '~~/server/utils/orders';


export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const number = String(getRouterParam(event, 'number') || '').trim();

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Order number required' });
  }

  const client = await serverSupabaseServiceRole(event);
  const order = await fetchOrderByNumber(client, number);

  // Чужой заказ неотличим от несуществующего
  if (!order || order.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' });
  }

  return toPublicOrder(order);
});
