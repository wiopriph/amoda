import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { randomUUID } from 'node:crypto';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
  }

  const productId = formData.find(f => f.name === 'product_id')?.data?.toString();
  const variantId = Number(formData.find(f => f.name === 'variant_id')?.data?.toString());
  const file = formData.find(f => f.name === 'file');

  if (!file || !productId || !variantId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product_id, variant_id or file' });
  }

  const fileExt = file.filename?.split('.').pop() || 'jpg';
  const filePath = `product_${productId}/variant_${variantId}/${randomUUID()}.${fileExt}`;

  const { error: uploadError } = await client.storage
    .from('products')
    .upload(filePath, file.data, {
      contentType: file.type,
      cacheControl: '31536000',
    });

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: uploadError.message });
  }

  const { data: publicUrl } = client.storage.from('products').getPublicUrl(filePath);

  console.log({
    variant_id: Number(variantId),
    url: publicUrl.publicUrl,
  });

  console.log('========');
  console.log(client.from('product_variant_images'));

  // сохраняем ссылку в product_variant_images
  const { error: insertError } = await client.from('product_variant_images')
    .insert({
      variant_id: Number(variantId),
      url: publicUrl.publicUrl,
    });

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message });
  }

  return { url: publicUrl.publicUrl };
});
