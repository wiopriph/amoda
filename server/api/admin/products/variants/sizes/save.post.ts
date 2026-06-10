import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody(event);

  const {
    id,
    size,
    stock,
  } = body;
  const variantId = body['variant_id'];
  const hasMsCode = Object.hasOwn(body, 'msCode') || Object.hasOwn(body, 'ms_code');
  const msCode = body.msCode ?? body['ms_code'];

  if (!variantId || !size) {
    throw createError({ statusCode: 400, statusMessage: 'Variant ID and size required' });
  }


  const payload = {
    'variant_id': variantId,
    size,
    stock: stock ?? 0,
  };

  if (hasMsCode) {
    Object.assign(payload, {
      'ms_code': msCode == null ? null : String(msCode).trim() || null,
    });
  }

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
