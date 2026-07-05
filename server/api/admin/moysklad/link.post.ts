import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type LinkItem = {
  localId: number
  msCode: string | null
};

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);
  const body = await readBody<{ links: LinkItem[] }>(event);

  if (!body?.links?.length) {
    throw createError({ statusCode: 400, statusMessage: 'links array is required' });
  }

  const updates = body.links.map(({ localId, msCode }) => ({
    id: localId,
    ms_code: msCode || null,
  }));

  const { error } = await client
    .from('product_variant_sizes')
    .upsert(updates, { onConflict: 'id' });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true, updated: updates.length };
});
