import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody(event);

  const { error } = await client.from('categories')
    .delete()
    .eq('id', body.id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true };
});
