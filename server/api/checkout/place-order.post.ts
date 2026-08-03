import { serverSupabaseServiceRole } from '#supabase/server';
import { notifyOrderToTelegram } from '~~/server/utils/notifyOrderToTelegram';
import { getVariantSnapshot, normalizeCartQty } from '~~/server/utils/cart';


type OrderItemInput = {
  variantId?: unknown
  sizeId?: unknown
  qty?: unknown
};

type Contact = { name?: unknown; phone?: unknown };

const MAX_ORDER_ITEMS = 50;
const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 30;

function generateOrderNumber() {
  const ymd = new Date().toISOString()
    .slice(2, 10)
    .replace(/-/g, '');
  const rnd = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');

  return `${ymd}-${rnd}`;
}

const toPositiveInt = (value: unknown, field: string) => {
  const number = typeof value === 'string' ? Number(value) : value;

  if (!Number.isInteger(number) || Number(number) <= 0) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` });
  }

  return Number(number);
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseServiceRole(event);

  const body = await readBody<{
    items: OrderItemInput[]
    contact: Contact
    pickupOfficeId?: number | null
  }>(event);

  if (!body?.items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Cart is empty' });
  }

  if (body.items.length > MAX_ORDER_ITEMS) {
    throw createError({ statusCode: 400, statusMessage: 'Too many items' });
  }

  const phone = String(body.contact?.phone ?? '').trim();
  const name = String(body.contact?.name ?? '').trim();

  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'Phone is required' });
  }

  const contact = {
    name: name.slice(0, MAX_NAME_LENGTH),
    phone: phone.slice(0, MAX_PHONE_LENGTH),
  };

  let pickupOfficeId: number | null = null;

  if (body.pickupOfficeId != null) {
    const id = toPositiveInt(body.pickupOfficeId, 'pickupOfficeId');

    const { data: office, error: officeErr } = await supabase
      .from('offices')
      .select('id, active')
      .eq('id', id)
      .maybeSingle();

    if (officeErr) {
      throw createError({ statusCode: 500, statusMessage: officeErr.message });
    }

    if (!office || office.active === false) {
      throw createError({ statusCode: 400, statusMessage: 'Pickup office not found or inactive' });
    }

    pickupOfficeId = id;
  }

  // Цены и принадлежность размера варианту берём только из базы —
  // клиентские price/totals не принимаются
  const itemRows: {
    'product_id': number
    'product_variant_id': number
    'product_variant_size_id': number
    'unit_price': number
    qty: number
  }[] = [];

  let total = 0;

  for (const item of body.items) {
    const variantId = toPositiveInt(item.variantId, 'variantId');
    const sizeId = toPositiveInt(item.sizeId, 'sizeId');
    const qty = normalizeCartQty(item.qty);

    const { price, productId } = await getVariantSnapshot(supabase, variantId, sizeId);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw createError({ statusCode: 500, statusMessage: 'Invalid product for variant' });
    }

    total += price * qty;

    itemRows.push({
      'product_id': productId,
      'product_variant_id': variantId,
      'product_variant_size_id': sizeId,
      'unit_price': price,
      qty,
    });
  }

  const orderNumber = generateOrderNumber();

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      number: orderNumber,
      'guest_contact': contact,
      status: 'PLACED',
      'payment_status': 'UNPAID',
      totals: { total },
      'pickup_office_id': pickupOfficeId,
    })
    .select('id, number, created_at')
    .single();

  if (orderErr || !orderRow) {
    throw createError({ statusCode: 500, statusMessage: orderErr?.message || 'Failed to create order' });
  }

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemRows.map(row => ({ ...row, 'order_id': orderRow.id })));

  if (itemsErr) {
    await supabase
      .from('orders')
      .delete()
      .eq('id', orderRow.id);

    throw createError({ statusCode: 500, statusMessage: itemsErr.message });
  }

  try {
    await notifyOrderToTelegram(event, {
      id: orderRow.id,
      number: orderRow.number,
      createdAt: orderRow.created_at,
    });
  } catch (error) {
    console.error('Failed to send telegram notifications', error);
  }

  setResponseStatus(event, 201);

  return { number: orderRow.number };
});
