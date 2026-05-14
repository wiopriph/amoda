import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);

  const q = String(getQuery(event).q || '').trim();
  const page = Math.max(1, Number(getQuery(event).page || 1));
  const limit = Math.min(100, Math.max(1, Number(getQuery(event).limit || 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client
    .from('carts')
    .select(
      `
      id,
      public_code,
      status,
      updated_at,
      expires_at,
      checkout_started_at,
      contact_snapshot
    `,
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (q) {
    query = query.ilike('public_code', `%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    limit,
    q: q || null,
  };
});
