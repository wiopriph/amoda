import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { normalizeProductId } from '~~/server/utils/favorites';


export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const productId = normalizeProductId(getRouterParam(event, 'id'));

  const client = await serverSupabaseServiceRole(event) as any;

  const { error } = await client
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true };
});
