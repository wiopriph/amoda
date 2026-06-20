import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type SaveBody = {
  id?: number | null
  name: string
  slug?: string
  parent_id?: number | null
  active?: boolean
  seo_title?: string | null
  seo_description?: string | null
  seo_content?: string | null
  h1_override?: string | null
};

type CategoryPayload = {
  name: string
  slug: string
  parent_id: number | null
  active: boolean
  seo_title: string | null
  seo_description: string | null
  seo_content: string | null
  h1_override: string | null
};

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

  const name = body.name.trim();
  const payload: CategoryPayload = {
    name,
    slug: body.slug ? slugify(body.slug) : slugify(name),
    parent_id: body.parent_id ?? null,
    active: body.active ?? true,
    seo_title: body.seo_title?.trim() || null,
    seo_description: body.seo_description?.trim() || null,
    seo_content: body.seo_content?.trim() || null,
    h1_override: body.h1_override?.trim() || null,
  };

  const res = body.id ?
    await client.from('categories').update(payload)
      .eq('id', body.id)
      .select()
      .single() :
    await client.from('categories').insert(payload)
      .select()
      .single();

  const { data, error } = res;

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Slug already exists' });
    }

    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
