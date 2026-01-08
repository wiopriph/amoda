import { serverSupabaseServiceRole } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);

  const q = String(getQuery(event).q || '').trim();
  const page = Math.max(1, Number(getQuery(event).page || 1));
  const limit = Math.min(100, Math.max(1, Number(getQuery(event).limit || 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client
    .from('orders')
    .select(
      `
      id,
      number,
      status,
      payment_status,
      totals,
      guest_contact,
      created_at,
      pickup_office:offices!orders_pickup_office_id_fkey (
        id,
        name
      )
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) {
    // ищем по номеру заказа или телефону гостя
    // (guest_contact->>'phone') индекс у тебя уже есть
    query = query.or(
      [
        `number.ilike.%${q}%`,
        `guest_contact->>phone.ilike.%${q}%`,
      ].join(','),
    );
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
