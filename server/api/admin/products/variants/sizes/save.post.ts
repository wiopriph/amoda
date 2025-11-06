import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody(event);

  const {
    id,
    variant_id,
    size,
    stock,
  } = body;

  if (!variant_id || !size) {
    throw createError({ statusCode: 400, statusMessage: 'Variant ID and size required' });
  }


  const payload = {
    variant_id,
    size,
    stock: stock ?? 0,
  };

  const { data, error } = id ?
    await client.from('product_variant_sizes').update(payload)
      .eq('id', id)
      .select()
      .single() :
    await client.from('product_variant_sizes').insert(payload)
      .select()
      .single();

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
