import { serverSupabaseServiceRole } from '#supabase/server';


type OpeningHours = Record<string, Array<[string, string]>>;

type Body = {
  slug: string;
  name: string;
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

  const slug = String(body?.slug || '').trim();
  const name = String(body?.name || '').trim();

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug required' });
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'name required' });
  }

  const payload = {
    slug,
    name,
    description: body.description ?? null,
    address: body.address ?? null,
    location_lat: body.locationLat ?? null,
    location_lng: body.locationLng ?? null,
    phone: body.phone ?? null,
    opening_hours: body.openingHours ?? null,
    active: body.active ?? true,
  };

  const { data, error } = await client
    .from('offices')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { id: data.id };
});
