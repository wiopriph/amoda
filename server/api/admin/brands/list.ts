import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);

  const { data, error } = await client.from('brands')
    .select('id, name, slug, active')
    .order('name', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
