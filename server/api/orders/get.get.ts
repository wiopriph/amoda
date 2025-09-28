import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const { number } = getQuery(event);

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Order number required' });
  }

  // 1) грузим заказ + вложенные позиции с джойнами к variant → product → images
  const { data, error } = await client
    .from('orders')
    .select(`
      id, number, status, payment_status, totals, guest_contact, created_at,
      items:order_items(
        id, qty, unit_price, total_price,
        variant:product_variants(
          id, sku, size, color, price,
          product:products(
            id, slug, title,
            images:product_images(url, sort)
          )
        )
      )
    `)
    .eq('number', String(number))
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' });
  }

  // 2) нормализуем позиции: плоская структура на фронт
  const items = (data.items || []).map((row: any) => {
    const variant = row.variant || {};
    const product = variant.product || {};
    const images = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []);
    const image = images.sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0))[0]?.url || null;

    return {
      id: row.id,
      qty: row.qty,
      unit_price: row.unit_price,
      total_price: row.total_price,

      // данные товара
      title: product.title ?? '',
      slug: product.slug ?? '',
      image,

      // данные варианта
      variant: {
        id: variant.id ?? null,
        sku: variant.sku ?? null,
        size: variant.size ?? null,
        color: variant.color ?? null,
      },
    };
  });

  return {
    id: data.id,
    number: data.number,
    status: data.status,
    payment_status: data.payment_status,
    totals: data.totals,
    guest_contact: data.guest_contact,
    created_at: data.created_at,
    items,
  };
});
