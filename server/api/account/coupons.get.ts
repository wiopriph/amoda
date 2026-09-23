import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { listGrantedCoupons, couponSummary } from '~~/server/utils/coupons';


export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const client = await serverSupabaseServiceRole(event);

  const granted = await listGrantedCoupons(client, user.id);

  return granted.map(item => ({
    ...couponSummary(item.coupon),
    minSubtotal: item.coupon.min_subtotal,
    maxDiscount: item.coupon.max_discount,
    expiresAt: item.expiresAt,
    status: item.status,
    usedInOrder: item.usedInOrder,
  }));
});
