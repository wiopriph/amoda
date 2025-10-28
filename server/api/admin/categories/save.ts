import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type SaveBody = {
  id?: number | null
  name: string
  gender_id?: number | null
  parent_id?: number | null
  active?: boolean
}

type CategoryPayload = {
  name: string
  slug: string
  gender_id: number | null
  parent_id: number | null
  active: boolean
}

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
  const body = (await readBody(event)) as SaveBody;

  if (!body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' });
  }

  const payload: CategoryPayload = {
    name: body.name.trim(),
    slug: slugify(body.name),
    gender_id: body.gender_id ?? null,
    parent_id: body.parent_id ?? null,
    active: body.active ?? true,
  };

  let res;

  if (body.id) {
    res = await client
      .from('categories')
      .update(payload)
      .eq('id', body.id)
      .select()
      .single();
  } else {
    res = await client
      .from('categories')
      .insert(payload)
      .select()
      .single();
  }

  const { data, error } = res;

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Slug already exists' });
    }

    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
