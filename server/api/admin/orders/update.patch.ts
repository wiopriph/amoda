import { serverSupabaseServiceRole } from '#supabase/server';


type Body = {
  number: string;
  status?: string;
  paymentStatus?: string;
};

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event);
  const body = (await readBody(event)) as Body;

  const number = String(body?.number || '').trim();

  if (!number) {
    throw createError({ statusCode: 400, statusMessage: 'Order number required' });
  }

  const patch: Record<string, any> = {};

  if (body.status) {
    patch.status = body.status;
  }

  if (body.paymentStatus) {
    patch.payment_status = body.paymentStatus;
  }

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' });
  }

  const { data, error } = await client
    .from('orders')
    .update(patch)
    .eq('number', number)
    .select('number,status,payment_status,created_at')
    .maybeSingle();

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  if (!data) throw createError({ statusCode: 404, statusMessage: 'Order not found' });

  return {
    number: data.number,
    status: data.status,
    paymentStatus: data.payment_status,
    createdAt: data.created_at,
  };
});
