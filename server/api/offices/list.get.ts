import { serverSupabaseClient } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const { data, error } = await db
    .from('offices')
    .select(`
      id,
      slug,
      name,
      description,
      address,
      location_lat,
      location_lng,
      phone,
      opening_hours,
      active,
      created_at
    `)
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    items: data || [],
  };
});
