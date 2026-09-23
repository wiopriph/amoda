import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { normalizeAoPhone } from '#shared/utils/phone';


type Body = { couponId?: number; phone?: string; expiresAt?: string | null };

// Выдать персональный купон клиентке по номеру телефона (аккаунт должен уже существовать)
export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event) as any;
  const body = await readBody<Body>(event) || {};

  const couponId = Number(body.couponId);
  const phone = normalizeAoPhone(body.phone);

  if (!Number.isInteger(couponId) || couponId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid couponId' });
  }

  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'Indica um número válido em Angola (+244 e 9 dígitos).' });
  }

  // В profiles.phone номер лежит как в Supabase Auth — без плюса (244XXXXXXXXX); ищем оба варианта
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('user_id, name')
    .in('phone', [phone, phone.replace(/^\+/, '')])
    .limit(1)
    .maybeSingle();

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: profileError.message });
  }

  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Não há conta com este número. A cliente precisa de entrar no site primeiro.' });
  }

  const { error } = await client
    .from('coupon_grants')
    .upsert({
      'coupon_id': couponId,
      'user_id': profile.user_id,
      'expires_at': body.expiresAt || null,
    }, { onConflict: 'coupon_id,user_id' });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true, name: profile.name ?? null };
});
