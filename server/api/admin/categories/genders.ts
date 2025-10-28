import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const { data, error } = await client
    .from('genders')
    .select('id, name, code')
    .order('id', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
