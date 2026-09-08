import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { addFavorites, normalizeProductId } from '~~/server/utils/favorites';


export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<{ product_id?: unknown; productId?: unknown }>(event);
  const productId = normalizeProductId(body?.product_id ?? body?.productId);

  const client = await serverSupabaseServiceRole(event);

  await addFavorites(client, user.id, [productId]);

  setResponseStatus(event, 201);

  return { ok: true };
});
