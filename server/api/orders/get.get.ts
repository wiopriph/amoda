import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const { number } = getQuery(event) as { number?: string };

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Order number required' });
  }

  const { data, error } = await client
    .from('orders')
    .select(`
      id,
      number,
      status,
      payment_status,
      totals,
      guest_contact,
      pickup_office_id,
      created_at,

      pickup_office:offices!orders_pickup_office_id_fkey (
        id,
        name,
        address,
        phone,
        opening_hours
      ),

      items:order_items(
        id,
        product_id,
        product_variant_id,
        product_variant_size_id,
        unit_price,
        qty,
        total_price,

        product:products!order_items_product_id_fkey(
          slug,
          title
        ),

        variant:product_variants!order_items_product_variant_id_fkey(
          id,
          color,
          price,
          images:product_variant_images!product_variant_images_variant_id_fkey(
            url,
            position
          )
        ),

        size:product_variant_sizes!order_items_product_variant_size_id_fkey(
          id,
          size
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

  const items = (data.items || []).map((row: any) => {
    const title = row.product?.title ?? '';
    const slug = row.product?.slug ?? '';

    let image: string | null = null;

    if (Array.isArray(row.variant?.images) && row.variant.images.length) {
      const sorted = [...row.variant.images].sort(
        (a, b) => (a?.position ?? 0) - (b?.position ?? 0),
      );

      image = sorted[0]?.url ?? null;
    }

    return {
      id: row.id,
      qty: row.qty,
      unitPrice: row.unit_price,
      totalPrice: row.total_price,
      title,
      slug,
      image,
      variant: {
        id: row.variant?.id ?? null,
        color: row.variant?.color ?? null,
        size: row.size?.size ?? null,
      },
    };
  });

  const pickupOffice = data.pickup_office ?
    {
      id: data.pickup_office.id,
      name: data.pickup_office.name,
      address: data.pickup_office.address,
      phone: data.pickup_office.phone,
      openingHours: data.pickup_office.opening_hours,
    } :
    null;

  return {
    id: data.id,
    number: data.number,
    status: data.status,
    paymentStatus: data.payment_status,
    totals: data.totals,
    guestContact: data.guest_contact,
    createdAt: data.created_at,
    pickupOffice,
    items,
  };
});
