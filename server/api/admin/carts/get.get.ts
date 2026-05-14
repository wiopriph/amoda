import { serverSupabaseServiceRole } from '#supabase/server';
import { getCartItems } from '~~/server/utils/cart';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const { publicCode } = getQuery(event) as { publicCode?: string };
  const normalizedPublicCode = String(publicCode || '').trim();

  if (!normalizedPublicCode) {
    throw createError({ statusCode: 400, statusMessage: 'Cart publicCode required' });
  }

  const { data, error } = await client
    .from('carts')
    .select(`
      id,
      public_code,
      session_id,
      user_id,
      status,
      updated_at,
      expires_at,
      checkout_started_at,
      contact_snapshot,
      meta
    `)
    .ilike('public_code', normalizedPublicCode)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Cart not found' });
  }

  const items = await getCartItems(client, data.id);
  const total = items.reduce((sum: number, item: any) => {
    const price = Number(item.priceSnapshot || 0);
    const qty = Number(item.qty || 0);

    return sum + price * qty;
  }, 0);

  return {
    id: data.id,
    publicCode: data.public_code,
    sessionId: data.session_id,
    userId: data.user_id ?? null,
    status: data.status,
    updatedAt: data.updated_at,
    expiresAt: data.expires_at,
    checkoutStartedAt: data.checkout_started_at,
    contactSnapshot: data.contact_snapshot ?? null,
    meta: data.meta ?? null,
    totals: {
      total,
    },
    items,
  };
});
