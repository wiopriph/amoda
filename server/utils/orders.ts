 

type SupabaseClient = any;

const ORDER_DETAIL_SELECT = `
  id,
  number,
  user_id,
  cart_id,
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
    location_lat,
    location_lng,
    map_url
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
`;

export const firstVariantImage = (variant: any): string | null => {
  if (!Array.isArray(variant?.images) || !variant.images.length) {
    return null;
  }

  const sorted = [...variant.images].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));

  return sorted[0]?.url ?? null;
};

const mapOrderItem = (row: any) => ({
  id: row.id,
  qty: row.qty,
  unitPrice: row.unit_price,
  totalPrice: row.total_price,
  title: row.product?.title ?? '',
  slug: row.product?.slug ?? '',
  image: firstVariantImage(row.variant),
  variant: {
    id: row.variant?.id ?? null,
    color: row.variant?.color ?? null,
    size: row.size?.size ?? null,
  },
});

const mapPickupOffice = (office: any) => (office ?
  {
    id: office.id,
    name: office.name,
    address: office.address,
    phone: office.phone,
    mapUrl: office.map_url,
    locationLat: office.location_lat,
    locationLng: office.location_lng,
  } :
  null);

export type OrderDetail = ReturnType<typeof mapOrderDetail>;

const mapOrderDetail = (data: any) => ({
  id: data.id,
  number: data.number,
  userId: data.user_id ?? null,
  cartId: data.cart_id ?? null,
  status: data.status,
  paymentStatus: data.payment_status,
  totals: data.totals,
  guestContact: data.guest_contact,
  createdAt: data.created_at,
  pickupOffice: mapPickupOffice(data.pickup_office),
  items: (data.items || []).map(mapOrderItem),
});

export const fetchOrderByNumber = async (client: SupabaseClient, number: string): Promise<OrderDetail | null> => {
  const { data, error } = await client
    .from('orders')
    .select(ORDER_DETAIL_SELECT)
    .eq('number', number)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data ? mapOrderDetail(data) : null;
};

// Публичный ответ без служебных полей (кто владелец, какая корзина)
export const toPublicOrder = ({ userId, cartId, ...order }: OrderDetail) => order;
