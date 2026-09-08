import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { listFavorites } from '~~/server/utils/favorites';


export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const client = await serverSupabaseServiceRole(event);

  return listFavorites(client, user.id);
});
