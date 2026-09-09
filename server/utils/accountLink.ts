import { SESSION_ID_RE } from '~~/server/utils/cart';


type SupabaseClient = any;

// Идемпотентно: корзины этого устройства, их заказы и гостевые заказы с тем же номером получают владельца.
// Вызывается при чтении списка заказов, поэтому первый заход в /conta после входа уже видит всё.
export const linkSessionToUser = async (client: SupabaseClient, user: any, rawSessionId: unknown) => {
  const sessionId = String(rawSessionId || '');
  const tasks: Promise<void>[] = [];

  if (SESSION_ID_RE.test(sessionId)) {
    tasks.push((async () => {
      const { data: carts, error } = await client
        .from('carts')
        .select('id')
        .eq('session_id', sessionId);

      if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message });
      }

      const cartIds = (carts || []).map((cart: any) => cart.id);

      if (!cartIds.length) {
        return;
      }

      const [cartsResult, ordersResult] = await Promise.all([
        client.from('carts').update({ 'user_id': user.id })
          .in('id', cartIds)
          .is('user_id', null),
        client.from('orders').update({ 'user_id': user.id })
          .in('cart_id', cartIds)
          .is('user_id', null),
      ]);

      const failed = cartsResult.error || ordersResult.error;

      if (failed) {
        throw createError({ statusCode: 500, statusMessage: failed.message });
      }
    })());
  }

  if (user.phone) {
    tasks.push((async () => {
      const { error } = await client.rpc('claim_orders_by_phone', {
        'p_user_id': user.id,
        'p_phone': user.phone,
      });

      // Функция появляется миграцией; до неё привязка по номеру просто не работает, список заказов — работает
      if (error) {
        console.error('claim_orders_by_phone failed', error.message);
      }
    })());
  }

  await Promise.all(tasks);
};
