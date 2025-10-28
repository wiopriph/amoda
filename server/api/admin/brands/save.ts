import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<{ id?: number; name: string; active?: boolean }>(event);

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name required' });
  }

  const name = body.name.trim();
  const slug = slugify(name);
  const active = body.active ?? true;

  const { data: existing, error: checkError } = await client
    .from('brands')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (checkError) {
    throw createError({ statusCode: 500, statusMessage: checkError.message });
  }

  if (existing && existing.id !== body.id) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already exists' });
  }

  if (body.id) {
    const { error } = await client
      .from('brands')
      .update({ name, slug, active })
      .eq('id', body.id);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return { updated: true };
  }

  const { error } = await client
    .from('brands')
    .insert({ name, slug, active });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { created: true };
});
