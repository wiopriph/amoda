import { serverSupabaseServiceRole } from '#supabase/server';


type CartItem = {
  productId: number
  variantId: number
  sizeId: number
  title: string
  price: number
  qty: number
  slug?: string
  image?: string | null
};

type Totals = { total: number; currency: string };
type Contact = { name: string; phone: string; email?: string | null };

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

  const body = await readBody<{
    items: CartItem[]
    totals: Totals
    contact: Contact
    pickupOfficeId?: number | null
  }>(event);

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

  let pickupOfficeId: number | null = null;

  if (body.pickupOfficeId != null) {
    const id = Number(body.pickupOfficeId);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid pickupOfficeId' });
    }

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

  const orderNumber = generateOrderNumber();

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      number: orderNumber,
      guest_contact: body.contact,
      status: 'PLACED',
      payment_status: 'UNPAID',
      totals: body.totals,
      pickup_office_id: pickupOfficeId,
    })
    .select('id, number')
    .single();

  if (orderErr || !orderRow) {
    throw createError({ statusCode: 500, statusMessage: orderErr?.message || 'Failed to create order' });
  }

  const itemRows = body.items.map((item) => {
    const productId = Number(item.productId);
    const variantId = Number(item.variantId);
    const sizeId = Number(item.sizeId);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid productId' });
    }

    if (!Number.isInteger(variantId) || variantId <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid variantId' });
    }

    if (!Number.isInteger(sizeId) || sizeId <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid sizeId' });
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
      product_variant_size_id: sizeId,
      unit_price: item.price,
      qty: item.qty,
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
