import { serverSupabaseServiceRole } from '#supabase/server';
import { normalizeProductBadges } from '~~/app/utils/productBadges';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type ProductSaveBody = {
  id?: number | string
  title?: string
  slug?: string
  brand_id?: number | string | null
  primary_category_id?: number | string | null
  description?: string | null
  active?: boolean
  badges?: unknown
};

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<ProductSaveBody>(event);

  if (!body.title) {
    throw createError({ statusCode: 400, statusMessage: 'Title required' });
  }

  if (!body.id && !body.slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug required for creation',
    });
  }

  const payload = {
    title: body.title,
    slug: body.slug ?? undefined,
    brand_id: body.brand_id || null,
    primary_category_id: body.primary_category_id || null,
    description: body.description || null,
    active: body.active ?? true,
    badges: normalizeProductBadges(body.badges),
  };

  if (body.id) {
    delete payload.slug;

    const { data, error } = await client
      .from('products')
      .update(payload)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return data;
  }

  let finalSlug = body.slug;
  let attempt = 0;

  while (true) {
    const { data, error } = await client
      .from('products')
      .insert({ ...payload, slug: finalSlug })
      .select()
      .single();

    if (!error) return data;

    if (error.code === '23505') {
      attempt++;
      finalSlug = `${body.slug}-${attempt + 1}`;
      continue;
    }

    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
