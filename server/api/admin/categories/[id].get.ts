import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const id = getRouterParam(event, 'id');

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category id' });
  }

  const { data, error } = await client
    .from('categories')
    .select('id, name, slug, parent_id, active, image, seo_title, seo_description, seo_content, h1_override')
    .eq('id', Number(id))
    .single();

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }

  return data;
});
