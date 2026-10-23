/* eslint-disable camelcase */
import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { randomUUID } from 'node:crypto';
import { assertUploadedWebp } from '~~/server/utils/uploads';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' });
  }

  const variantIdRaw = form.find(p => p.name === 'variant_id')?.data?.toString();
  const variantId = Number(variantIdRaw);

  // Ресайз и конвертация в webp происходят в браузере админки (app/utils/clientImage.ts):
  // files — мастера для галереи, smalls — превью 480px для карточек, попарно по индексу
  const files = form.filter(p => p.name === 'files' && p.filename);
  const smalls = form.filter(p => p.name === 'smalls' && p.filename);

  if (!variantId || !Number.isFinite(variantId) || !files.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields or files' });
  }

  if (smalls.length !== files.length) {
    throw createError({ statusCode: 400, statusMessage: 'Each image needs a small preview' });
  }

  const uploaded: string[] = [];

  for (const [index, file] of files.entries()) {
    const small = smalls[index];

    assertUploadedWebp(file, 3 * 1024 * 1024);
    assertUploadedWebp(small, 800 * 1024);

    const base = randomUUID();
    const fullPath = `products/${variantId}/${base}_m.webp`;
    const smallPath = `products/${variantId}/${base}_s.webp`;

    const { error: fullErr } = await client
      .storage.from('products')
      .upload(fullPath, file.data, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });

    if (fullErr) {
      throw createError({ statusCode: 500, statusMessage: fullErr.message });
    }

    const { error: smallErr } = await client
      .storage.from('products')
      .upload(smallPath, small.data, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });

    if (smallErr) {
      await client.storage.from('products').remove([fullPath]);
      throw createError({ statusCode: 500, statusMessage: smallErr.message });
    }

    const { data: pub } = client.storage.from('products').getPublicUrl(fullPath);

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
