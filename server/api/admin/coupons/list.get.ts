import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { COUPON_COLUMNS, mapCoupon } from '~~/server/utils/coupons';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event) as any;

  const [{ data: coupons, error }, { data: redemptions, error: redemptionsError }, { data: grants, error: grantsError }] = await Promise.all([
    client.from('coupons').select(COUPON_COLUMNS)
      .order('created_at', { ascending: false }),
    client.from('coupon_redemptions').select('coupon_id, status')
      .neq('status', 'released'),
    client.from('coupon_grants').select('coupon_id'),
  ]);

  const failed = error || redemptionsError || grantsError;

  if (failed) {
    throw createError({ statusCode: 500, statusMessage: failed.message });
  }

  const uses = new Map<number, number>();
  const granted = new Map<number, number>();

  for (const redemption of redemptions || []) {
    uses.set(redemption.coupon_id, (uses.get(redemption.coupon_id) || 0) + 1);
  }

  for (const grant of grants || []) {
    granted.set(grant.coupon_id, (granted.get(grant.coupon_id) || 0) + 1);
  }

  return (coupons || []).map((row: any) => ({
    ...mapCoupon(row),
    uses: uses.get(row.id) || 0,
    grants: granted.get(row.id) || 0,
  }));
});
