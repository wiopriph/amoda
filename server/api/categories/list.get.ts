import { serverSupabaseClient } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseClient(event);

  const { data, error } = await client
    .from('categories')
    .select('id, name, slug')
    .eq('active', true)
    .order('id', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    return [];
  }

  return data;
});
