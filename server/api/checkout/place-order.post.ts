// server/api/checkout/place-order.post.ts
import { serverSupabaseServiceRole } from '#supabase/server';


type CartItem = {
  // "productId:variantId" или "productId:variantId:sizeId"
  id: string
  title: string
  price: number // integer AOA
  qty: number
  slug?: string // опционально — если хочешь писать в order_items
  image?: string // опционально
}

type Totals = { total: number; currency: string }
type Contact = { name: string; phone: string; email?: string | null }

// Если нет триггера на номер — сгенерим здесь
function generateOrderNumber() {
  const ymd = new Date().toISOString()
    .slice(2, 10)
    .replace(/-/g, '');
  const rnd = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');

  return `${ymd}-${rnd}`;
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseServiceRole(event);
  const body = await readBody<{ items: CartItem[]; totals: Totals; contact: Contact }>(event);

  if (!body?.items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Cart is empty' });
  }

  if (!body.contact?.name || !body.contact?.phone) {
    throw createError({ statusCode: 400, statusMessage: 'Name and phone are required' });
  }

  if (!Number.isInteger(body.totals?.total) || body.totals.total < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid totals.total' });
  }

  if (body.totals?.currency && body.totals.currency !== 'AOA') {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported currency' });
  }

  // --- создаём заказ (в нашей схеме: number, name, phone, email, totals, status)
  const orderNumber = generateOrderNumber();

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      number: orderNumber,
      guest_contact: body.contact,
      status: 'PLACED',
      payment_status: 'UNPAID',
      totals: body.totals,
    })
    .select('id, number')
    .single();

  if (orderErr || !orderRow) {
    throw createError({ statusCode: 500, statusMessage: orderErr?.message || 'Failed to create order' });
  }

  // --- подготавливаем позиции заказа
  const itemRows = body.items.map((item) => {
    const [productStr, variantStr, sizeStr] = String(item.id)
      .split(':');
    const productId = Number(productStr);
    const variantId = Number(variantStr);
    const sizeId = sizeStr ? Number(sizeStr) : null;

    if (!Number.isInteger(productId) || productId <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid product id' });
    }

    if (!Number.isInteger(variantId) || variantId <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid variant id' });
    }

    if (sizeId !== null && (!Number.isInteger(sizeId) || sizeId <= 0)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid size id' });
    }

    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid qty' });
    }

    if (!Number.isInteger(item.price) || item.price < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid price' });
    }

    return {
      order_id: orderRow.id,
      product_id: productId,
      product_variant_id: variantId,
      product_variant_size_id: sizeId, // может быть null
      unit_price: item.price,
      qty: item.qty,
      // total_price у нас STORED (генерируется в БД), поэтому не передаём
    };
  });

  // --- вставляем позиции; при ошибке удаляем заказ (простой откат для MVP)
  const { error: itemsErr } = await supabase.from('order_items')
    .insert(itemRows);

  if (itemsErr) {
    await supabase.from('orders')
      .delete()
      .eq('id', orderRow.id);

    throw createError({ statusCode: 500, statusMessage: itemsErr.message });
  }

  setResponseStatus(event, 201);

  return { number: orderRow.number };
});
