import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const couponId = Number(getQuery(event).couponId);

  if (!Number.isInteger(couponId) || couponId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid couponId' });
  }

  const client = await serverSupabaseServiceRole(event) as any;

  const { data, error } = await client
    .from('coupon_redemptions')
    .select('id, discount, status, created_at, order:orders(number, status, guest_contact)')
    .eq('coupon_id', couponId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    discount: row.discount,
    status: row.status,
    createdAt: row.created_at,
    orderNumber: row.order?.number ?? null,
    orderStatus: row.order?.status ?? null,
    phone: row.order?.guest_contact?.phone ?? null,
  }));
});
