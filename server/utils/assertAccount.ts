import { serverSupabaseUser } from '#supabase/server';


const hasAdminRole = (user: any) => {
  const roles = user?.app_metadata?.roles || [];

  return Array.isArray(roles) && roles.includes('admin');
};

// Кабинет за флагом: пока NUXT_PUBLIC_ACCOUNT_ENABLED выключен, API доступно только админу
export async function assertAccount(event: any) {
  // serverSupabaseUser бросает 500 «Auth session missing» без куки — для нас это обычный 401
  const user = await serverSupabaseUser(event).catch(() => null);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized — user not logged in' });
  }

  const { accountEnabled } = useRuntimeConfig(event).public;

  if (!accountEnabled && !hasAdminRole(user)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }

  return user;
}
