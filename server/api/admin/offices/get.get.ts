import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const { id } = getQuery(event) as { id?: string };

  const officeId = Number(id);

  if (!officeId) {
    throw createError({ statusCode: 400, statusMessage: 'Office id required' });
  }

  const { data, error } = await client
    .from('offices')
    .select(`
      id, slug, name, description, address,
      location_lat, location_lng, phone, opening_hours,
      active, created_at
    `)
    .eq('id', officeId)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Office not found' });
  }

  return data;
});
