import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { randomUUID } from 'node:crypto';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' });
  }

  const productId = form.find(p => p.name === 'product_id')?.data?.toString();
  const variantId = Number(form.find(p => p.name === 'variant_id')?.data?.toString());
  const files = form.filter(p => p.name === 'files' && p.filename);

  if (!productId || !variantId || !files.length)
    throw createError({ statusCode: 400, statusMessage: 'Missing fields or files' });

  const uploaded: string[] = [];

  for (const f of files) {
    const ext = (f.filename?.split('.').pop() || 'jpg').toLowerCase();
    const path = `product_${productId}/variant_${variantId}/${randomUUID()}.${ext}`;

    const { error: upErr } = await client
      .storage.from('products')
      .upload(path, f.data!, {
        contentType: f.type || 'application/octet-stream',
        cacheControl: '31536000',
      });

    if (upErr) {
      throw createError({ statusCode: 500, statusMessage: upErr.message });
    }

    const { data: pub } = client.storage.from('products').getPublicUrl(path);

    uploaded.push(pub.publicUrl);
  }

  const { error: insertErr } = await client
    .from('product_variant_images')
    .insert(uploaded.map(url => ({ variant_id: variantId, url })));

  if (insertErr) {
    throw createError({ statusCode: 500, statusMessage: insertErr.message });
  }


  return { ok: true, count: uploaded.length, urls: uploaded };
});
