import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { randomUUID } from 'node:crypto';
import { assertUploadedWebp } from '~~/server/utils/uploads';


const BUCKET = 'categories';

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' });
  }

  const categoryIdRaw = form.find(p => p.name === 'category_id')?.data?.toString();
  const categoryId = Number(categoryIdRaw);
  const file = form.find(p => p.name === 'file' && p.filename);

  if (!categoryId || !Number.isFinite(categoryId) || !file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category_id or file' });
  }

  const { data: category, error: fetchErr } = await client
    .from('categories')
    .select('id, image')
    .eq('id', categoryId)
    .single();

  if (fetchErr || !category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }

  // Delete old image from storage if exists
  if (category.image) {
    const oldPath = category.image.split(`/${BUCKET}/`).pop();

    if (oldPath) {
      await client.storage.from(BUCKET).remove([oldPath]);
    }
  }

  // Квадрат 400x400 webp готовит браузер админки (prepareCategoryImage)
  assertUploadedWebp(file, 500 * 1024);

  const path = `${categoryId}/${randomUUID()}.webp`;

  const { error: upErr } = await client
    .storage.from(BUCKET)
    .upload(path, file.data, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });

  if (upErr) {
    throw createError({ statusCode: 500, statusMessage: upErr.message });
  }

  const { data: pub } = client.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: updateErr } = await client
    .from('categories')
    .update({ image: publicUrl })
    .eq('id', categoryId);

  if (updateErr) {
    throw createError({ statusCode: 500, statusMessage: updateErr.message });
  }

  return { ok: true, url: publicUrl };
});
