import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { addFavorites, listFavorites, normalizeProductIds } from '~~/server/utils/favorites';


// При входе избранное из localStorage доливается к серверному; ответ — полный список
export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<{ product_ids?: unknown; productIds?: unknown }>(event);
  const productIds = normalizeProductIds(body?.product_ids ?? body?.productIds);

  const client = await serverSupabaseServiceRole(event);

  // Удалённые товары в локальном списке не должны ломать слияние — добавляем по одному, ошибки 404 глотаем
  for (const productId of productIds) {
    try {
      await addFavorites(client, user.id, [productId]);
    } catch (addError: any) {
      if (addError?.statusCode !== 404) {
        throw addError;
      }
    }
  }

  return listFavorites(client, user.id);
});
