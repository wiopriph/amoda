import { getOptionalUser } from '~~/server/utils/auth';
import { hasAdminRole } from '#shared/utils/auth';


// Кабинет за флагом: пока NUXT_PUBLIC_ACCOUNT_ENABLED выключен, API доступно только админу
export async function assertAccount(event: any) {
  const user = await getOptionalUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized — user not logged in' });
  }

  const { accountEnabled } = useRuntimeConfig(event).public;

  if (!accountEnabled && !hasAdminRole(user)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }

  return user;
}
