import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { checkCoupon, couponSummary, listGrantedCoupons, normalizeCouponCode } from '~~/server/utils/coupons';


type Body = { code?: unknown; subtotal?: unknown };

// Превью скидки для чекаута. Без кода — лучший доступный персональный купон клиентки.
export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<Body>(event) || {};
  const subtotal = Math.max(0, Math.trunc(Number(body.subtotal) || 0));
  const client = await serverSupabaseServiceRole(event);

  const rawCode = String(body.code ?? '').trim();

  if (rawCode) {
    const code = normalizeCouponCode(rawCode);

    if (!code) {
      return { ok: false, reason: 'not_found', coupon: null, discount: 0 };
    }

    const result = await checkCoupon(client, user.id, code, subtotal);

    if (!result.ok) {
      return { ok: false, reason: result.reason, coupon: null, discount: 0 };
    }

    const { data: coupon } = await client
      .from('coupons')
      .select('code, discount_type, value')
      .eq('id', result.couponId)
      .single();

    return { ok: true, reason: null, coupon: couponSummary(coupon), discount: result.discount };
  }

  const granted = (await listGrantedCoupons(client, user.id)).filter(item => item.status === 'available');

  let best: { coupon: any; discount: number } | null = null;

  for (const item of granted) {
    const result = await checkCoupon(client, user.id, item.coupon.code, subtotal);

    if (result.ok && (!best || result.discount > best.discount)) {
      best = { coupon: item.coupon, discount: result.discount };
    }
  }

  if (!best) {
    return { ok: false, reason: null, coupon: null, discount: 0 };
  }

  return { ok: true, reason: null, coupon: couponSummary(best.coupon), discount: best.discount };
});
