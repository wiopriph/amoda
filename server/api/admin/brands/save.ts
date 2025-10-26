import { serverSupabaseServiceRole } from '#supabase/server';


function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<{ id?: number; name: string; active?: boolean }>(event);

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name required' });
  }

  const name = body.name.trim() as string;
  const slug = slugify(name) as string;
  const active = body.active ?? false;

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
