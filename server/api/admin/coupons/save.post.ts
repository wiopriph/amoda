/* eslint-disable camelcase */
import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { COUPON_COLUMNS, mapCoupon, normalizeCouponCode } from '~~/server/utils/coupons';


type Body = {
  id?: number | null
  code?: string
  kind?: string
  discountType?: string
  value?: number
  minSubtotal?: number | null
  maxDiscount?: number | null
  startsAt?: string | null
  endsAt?: string | null
  maxUses?: number | null
  perUserLimit?: number | null
  active?: boolean
  note?: string | null
};

const optionalPositiveInt = (value: unknown, field: string) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` });
  }

  return number;
};

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event) as any;
  const body = await readBody<Body>(event) || {};

  const code = normalizeCouponCode(body.code);

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Código: 3–32 letras latinas ou dígitos' });
  }

  if (!['public', 'personal'].includes(String(body.kind))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid kind' });
  }

  if (!['percent', 'fixed'].includes(String(body.discountType))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid discountType' });
  }

  const value = optionalPositiveInt(body.value, 'value');

  if (!value || (body.discountType === 'percent' && value > 100)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid value' });
  }

  const row = {
    code,
    kind: body.kind,
    discount_type: body.discountType,
    value,
    min_subtotal: optionalPositiveInt(body.minSubtotal, 'minSubtotal'),
    max_discount: optionalPositiveInt(body.maxDiscount, 'maxDiscount'),
    starts_at: body.startsAt || new Date().toISOString(),
    ends_at: body.endsAt || null,
    max_uses: optionalPositiveInt(body.maxUses, 'maxUses'),
    per_user_limit: optionalPositiveInt(body.perUserLimit, 'perUserLimit') || 1,
    active: body.active ?? true,
    note: String(body.note || '').trim() || null,
  };

  const query = body.id ?
    client.from('coupons').update(row)
      .eq('id', body.id) :
    client.from('coupons').insert(row);

  const { data, error } = await query.select(COUPON_COLUMNS).single();

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Já existe um cupão com este código.' });
    }

    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return mapCoupon(data);
});
