import { serverSupabaseServiceRole } from '#supabase/server';
import { fetchOrderByNumber, toPublicOrder } from '~~/server/utils/orders';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const { number } = getQuery(event) as { number?: string };

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Order number required' });
  }

  const order = await fetchOrderByNumber(client, String(number));

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' });
  }

  return toPublicOrder(order);
});
