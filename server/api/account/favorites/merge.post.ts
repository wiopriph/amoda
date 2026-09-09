import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { addFavorites, listFavorites, normalizeProductIds } from '~~/server/utils/favorites';


// При входе избранное из localStorage доливается к серверному; ответ — полный список
export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<{ product_ids?: unknown; productIds?: unknown }>(event);
  const productIds = normalizeProductIds(body?.product_ids ?? body?.productIds);

  const client = await serverSupabaseServiceRole(event) as any;

  if (productIds.length) {
    // Удалённые из каталога товары отсеиваем заранее, чтобы один upsert не упал на внешнем ключе
    const { data: products, error } = await client
      .from('products')
      .select('id')
      .in('id', productIds);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    await addFavorites(client, user.id, (products || []).map((product: any) => Number(product.id)));
  }

  return listFavorites(client, user.id);
});
