import { serverSupabaseServiceRole } from '#supabase/server';
import { assertExtension } from '~~/server/utils/assertExtension';


export default defineEventHandler(async (event) => {
  assertExtension(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<{ localProductId: number; msProductId: string | null }>(event);

  if (!body?.localProductId) {
    throw createError({ statusCode: 400, statusMessage: 'localProductId is required' });
  }

  const { error } = await client
    .from('products')
    .update({ ms_product_id: body.msProductId ?? null })
    .eq('id', body.localProductId);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true };
});
