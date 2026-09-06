import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { getOrCreateProfile } from '~~/server/utils/profile';


const MAX_NAME_LENGTH = 120;

// Телефон здесь не меняется: это подтверждённый номер из Supabase Auth, смена — через поддержку
export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<{ name?: unknown }>(event) || {};

  if (!('name' in body)) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' });
  }

  const name = String(body.name ?? '').trim();

  // Гарантируем строку профиля до UPDATE (аккаунты старше миграции)
  await getOrCreateProfile(event, user);

  const client = await serverSupabaseServiceRole(event) as any;

  const { error } = await client
    .from('profiles')
    .update({ name: name ? name.slice(0, MAX_NAME_LENGTH) : null })
    .eq('user_id', user.id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return getOrCreateProfile(event, user);
});
