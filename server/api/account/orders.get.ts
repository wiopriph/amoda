import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { firstVariantImage } from '~~/server/utils/orders';


const MAX_ORDERS = 50;

export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const client = await serverSupabaseServiceRole(event) as any;

  const { data, error } = await client
    .from('orders')
    .select(`
      number,
      status,
      payment_status,
      totals,
      created_at,
      items:order_items(
        qty,
        variant:product_variants!order_items_product_variant_id_fkey(
          images:product_variant_images!product_variant_images_variant_id_fkey(url, position)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(MAX_ORDERS);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return (data || []).map((row: any) => {
    const items = row.items || [];

    return {
      number: row.number,
      status: row.status,
      paymentStatus: row.payment_status,
      total: row.totals?.total ?? 0,
      createdAt: row.created_at,
      itemsCount: items.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0),
      images: items
        .map((item: any) => firstVariantImage(item.variant))
        .filter(Boolean)
        .slice(0, 3),
    };
  });
});
