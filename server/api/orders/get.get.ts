import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
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

  // Кнопка «Ver na minha conta» показывается только владелице заказа
  const user = await serverSupabaseUser(event).catch(() => null);

  return {
    ...toPublicOrder(order),
    isMine: Boolean(user && order.userId === user.id),
  };
});
