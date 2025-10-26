import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<{ id: number }>(event);

  if (!body.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID required' });
  }

  const { error } = await client.from('brands')
    .delete()
    .eq('id', body.id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { deleted: true };
});
