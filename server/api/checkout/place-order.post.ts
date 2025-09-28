// server/api/checkout/place-order.post.ts
import { serverSupabaseServiceRole } from '#supabase/server';


type CartItem = {
  id: string // ожидаем формат "productId:variantId" (например "12:345")
  title: string
  price: number // AOA в целых (integer)
  qty: number
}

type Totals = { total: number; currency: string }
type Contact = { name: string; phone: string; email: string }

export default defineEventHandler(async (event) => {
  const supa = await serverSupabaseServiceRole(event);
  const body = await readBody<{ items: CartItem[]; totals: Totals; contact: Contact }>(event);

  if (!body?.items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Cart is empty' });
  }

  // 1) Создаём заказ (номер выставит триггер)
  const { data: order, error: orderErr } = await supa
    .from('orders')
    .insert({
      user_id: null,
      guest_contact: body.contact,
      status: 'PLACED',
      payment_status: 'UNPAID',
      totals: body.totals,
    })
    .select('id, number')
    .single();

  if (orderErr) {
    throw createError({ statusCode: 500, statusMessage: orderErr.message });
  }

  // 2) Готовим строки order_items
  const itemsRows = body.items.map((it) => {
    // ждём id вида "productId:variantId"
    const parts = String(it.id).split(':');
    const variantId = Number(parts[1]); // вторая часть — variantId

    if (!Number.isInteger(variantId) || variantId <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Variant is required for each item' });
    }

    if (!Number.isInteger(it.qty) || it.qty <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid qty' });
    }

    if (!Number.isInteger(it.price) || it.price < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid price' });
    }

    return {
      order_id: order.id,
      variant_id: variantId,
      qty: it.qty,
      unit_price: it.price,
      total_price: it.price * it.qty,
    };
  });

  // 3) Пишем позиции. Если ошибка — удаляем заказ (грубый откат для MVP).
  const { error: itemsErr } = await supa.from('order_items').insert(itemsRows);

  if (itemsErr) {
    await supa.from('orders').delete()
      .eq('id', order.id);

    throw createError({ statusCode: 500, statusMessage: itemsErr.message });
  }

  setResponseStatus(event, 201);

  return { number: order.number };
});
