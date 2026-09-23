/* eslint-disable camelcase */

type SupabaseClient = any;

export type CouponRow = {
  id: number
  code: string
  kind: 'public' | 'personal'
  discount_type: 'percent' | 'fixed'
  value: number
  min_subtotal: number | null
  max_discount: number | null
  starts_at: string
  ends_at: string | null
  max_uses: number | null
  per_user_limit: number
  active: boolean
  note: string | null
  created_at: string
};

export type CouponCheckResult = {
  ok: boolean
  reason: string | null
  couponId: number | null
  discount: number
};

// Выходные колонки SQL-функций с префиксом r_ (иначе plpgsql путает их с колонками таблиц)
const mapCheckResult = (row: any): CouponCheckResult => ({
  ok: Boolean(row?.r_ok),
  reason: row?.r_reason ?? null,
  couponId: row?.r_coupon_id ?? null,
  discount: Number(row?.r_discount ?? 0),
});

export const COUPON_COLUMNS = 'id, code, kind, discount_type, value, min_subtotal, max_discount, starts_at, ends_at, max_uses, per_user_limit, active, note, created_at';

const CODE_RE = /^[A-Z0-9]{3,32}$/;

export const normalizeCouponCode = (value: unknown) => {
  const code = String(value ?? '').trim()
    .toUpperCase();

  return CODE_RE.test(code) ? code : null;
};

export const mapCoupon = (row: CouponRow) => ({
  id: row.id,
  code: row.code,
  kind: row.kind,
  discountType: row.discount_type,
  value: row.value,
  minSubtotal: row.min_subtotal,
  maxDiscount: row.max_discount,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  maxUses: row.max_uses,
  perUserLimit: row.per_user_limit,
  active: row.active,
  note: row.note,
  createdAt: row.created_at,
});

export const couponSummary = (row: Pick<CouponRow, 'code' | 'discount_type' | 'value'>) => ({
  code: row.code,
  discountType: row.discount_type,
  value: row.value,
});

const rpcSingle = async <T>(client: SupabaseClient, fn: string, args: Record<string, unknown>): Promise<T> => {
  const { data, error } = await client.rpc(fn, args);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return (Array.isArray(data) ? data[0] : data) as T;
};

export const checkCoupon = async (client: SupabaseClient, userId: string, code: string, subtotal: number) =>
  mapCheckResult(await rpcSingle(client, 'coupon_check', { p_user_id: userId, p_code: code, p_subtotal: subtotal }));

export const reserveCoupon = async (client: SupabaseClient, userId: string, code: string, subtotal: number, orderId: number) =>
  mapCheckResult(await rpcSingle(client, 'coupon_reserve', {
    p_user_id: userId, p_code: code, p_subtotal: subtotal, p_order_id: orderId,
  }));

export type GrantedCoupon = {
  coupon: CouponRow
  grantedAt: string
  expiresAt: string | null
  status: 'available' | 'used' | 'expired' | 'inactive'
  usedInOrder: string | null
};

// Персональные купоны клиентки с состоянием — для вкладки Cupões и авто-подстановки в чекауте
export const listGrantedCoupons = async (client: SupabaseClient, userId: string): Promise<GrantedCoupon[]> => {
  const [{ data: grants, error: grantsError }, { data: redemptions, error: redemptionsError }] = await Promise.all([
    client
      .from('coupon_grants')
      .select(`granted_at, expires_at, coupon:coupons(${COUPON_COLUMNS})`)
      .eq('user_id', userId)
      .order('granted_at', { ascending: false }),
    client
      .from('coupon_redemptions')
      .select('coupon_id, status, order:orders(number)')
      .eq('user_id', userId)
      .neq('status', 'released'),
  ]);

  if (grantsError || redemptionsError) {
    throw createError({ statusCode: 500, statusMessage: (grantsError || redemptionsError).message });
  }

  const usedBy = new Map<number, { count: number; order: string | null }>();

  for (const redemption of redemptions || []) {
    const entry = usedBy.get(redemption.coupon_id) || { count: 0, order: null };

    entry.count += 1;
    entry.order = entry.order || redemption.order?.number || null;
    usedBy.set(redemption.coupon_id, entry);
  }

  const now = Date.now();

  return (grants || [])
    .filter((grant: any) => grant.coupon)
    .map((grant: any) => {
      const coupon = grant.coupon as CouponRow;
      const used = usedBy.get(coupon.id);
      const expiresAt = grant.expires_at || coupon.ends_at;

      let status: GrantedCoupon['status'] = 'available';

      if (used && used.count >= coupon.per_user_limit) {
        status = 'used';
      } else if (expiresAt && new Date(expiresAt).getTime() < now) {
        status = 'expired';
      } else if (!coupon.active || new Date(coupon.starts_at).getTime() > now) {
        status = 'inactive';
      }

      return {
        coupon,
        grantedAt: grant.granted_at,
        expiresAt,
        status,
        usedInOrder: used?.order ?? null,
      };
    });
};
