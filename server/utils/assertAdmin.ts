import { serverSupabaseUser } from '#supabase/server';


export async function assertAdmin(event: any) {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — user not logged in',
    });
  }

  const roles = user.app_metadata?.roles || [];

  const isAdmin = Array.isArray(roles) && roles.includes('admin');

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — admin access only',
    });
  }

  return user;
}
