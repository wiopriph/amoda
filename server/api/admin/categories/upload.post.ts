import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createError } from 'h3';


const BUCKET = 'categories';
const SIZE = 400;

async function processCategoryImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: SIZE, height: SIZE, fit: 'cover', position: 'centre' })
      .toFormat('webp', { quality: 82 })
      .toBuffer();
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Error processing image' });
  }
}

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

  const processed = await processCategoryImage(file.data as Buffer);
  const path = `${categoryId}/${randomUUID()}.webp`;

  const { error: upErr } = await client
    .storage.from(BUCKET)
    .upload(path, processed, {
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
