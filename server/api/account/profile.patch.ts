import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAccount } from '~~/server/utils/assertAccount';
import { mapProfile, PROFILE_COLUMNS } from '~~/server/utils/profile';


const MAX_NAME_LENGTH = 120;

// Телефон здесь не меняется: это подтверждённый номер из Supabase Auth, смена — через поддержку
export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);
  const body = await readBody<{ name?: unknown }>(event) || {};

  if (!('name' in body)) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' });
  }

  const name = String(body.name ?? '').trim();

  const client = await serverSupabaseServiceRole(event) as any;

  // upsert создаёт строку аккаунтам старше миграции и обновляет имя за один запрос
  const { data, error } = await client
    .from('profiles')
    .upsert({ 'user_id': user.id, name: name ? name.slice(0, MAX_NAME_LENGTH) : null }, { onConflict: 'user_id' })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return mapProfile(data, user);
});
