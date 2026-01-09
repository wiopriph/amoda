import { serverSupabaseServiceRole } from '#supabase/server';


type OpeningHours = Record<string, Array<[string, string]>>;

type Body = {
  id: number;
  slug?: string;
  name?: string;
  description?: string | null;
  address?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  phone?: string | null;
  openingHours?: OpeningHours | null;
  active?: boolean;
};

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const body = (await readBody(event)) as Body;

  const id = Number(body?.id);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id required' });
  }

  const patch: Record<string, any> = {};

  if (body.slug != null) {
    patch.slug = String(body.slug).trim();
  }

  if (body.name != null) {
    patch.name = String(body.name).trim();
  }

  if (body.description !== undefined) {
    patch.description = body.description;
  }

  if (body.address !== undefined) {
    patch.address = body.address;
  }

  if (body.locationLat !== undefined) {
    patch.location_lat = body.locationLat;
  }

  if (body.locationLng !== undefined) {
    patch.location_lng = body.locationLng;
  }

  if (body.phone !== undefined) {
    patch.phone = body.phone;
  }

  if (body.openingHours !== undefined) {
    patch.opening_hours = body.openingHours;
  }

  if (body.active !== undefined) {
    patch.active = body.active;
  }

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' });
  }

  const { data, error } = await client
    .from('offices')
    .update(patch)
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Office not found' });
  }

  return { id: data.id };
});
