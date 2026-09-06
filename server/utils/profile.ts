import { serverSupabaseServiceRole } from '#supabase/server';
import type { H3Event } from 'h3';


export type AccountProfile = {
  name: string | null
  phone: string | null
  email: string | null
};

const PROFILE_COLUMNS = 'user_id, name, phone';

const mapProfile = (row: any, user: any): AccountProfile => ({
  name: row?.name ?? null,
  // Источник правды — подтверждённый номер в Supabase Auth; profiles.phone лишь его зеркало
  phone: user?.phone || row?.phone || null,
  email: user?.email ?? null,
});

// Профиль создаётся триггером при регистрации; для аккаунтов старше миграции — лениво здесь
export const getOrCreateProfile = async (event: H3Event, user: any): Promise<AccountProfile> => {
  const client = await serverSupabaseServiceRole(event) as any;

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (data) {
    return mapProfile(data, user);
  }

  const { data: created, error: insertError } = await client
    .from('profiles')
    .upsert({ 'user_id': user.id }, { onConflict: 'user_id', ignoreDuplicates: true })
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message });
  }

  return mapProfile(created, user);
};
