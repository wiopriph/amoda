import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { randomUUID } from 'node:crypto';
import { processImageBuffer } from '~~/server/utils/images';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' });
  }

  const variantIdRaw = form.find(p => p.name === 'variant_id')?.data?.toString();
  const variantId = Number(variantIdRaw);
  const files = form.filter(p => p.name === 'files' && p.filename);

  if (!variantId || !Number.isFinite(variantId) || !files.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields or files' });
  }

  const uploaded: string[] = [];

  for (const f of files) {
    if (!f.data) continue;

    const processed = await processImageBuffer(f.data as Buffer, {
      width: 1920,
      height: 1080,
    });

    const fileName = `${randomUUID()}.webp`;
    const path = `products/${variantId}/${fileName}`;

    const { error: upErr } = await client
      .storage.from('products')
      .upload(path, processed, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });

    if (upErr) {
      throw createError({ statusCode: 500, statusMessage: upErr.message });
    }

    const { data: pub } = client.storage.from('products').getPublicUrl(path);

    uploaded.push(pub.publicUrl);
  }

  if (!uploaded.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' });
  }

  const { error: insertErr } = await client
    .from('product_variant_images')
    .insert(uploaded.map(url => ({ variant_id: variantId, url })));

  if (insertErr) {
    throw createError({ statusCode: 500, statusMessage: insertErr.message });
  }

  return { ok: true, count: uploaded.length, urls: uploaded };
});
