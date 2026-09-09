import { getOptionalUser } from '~~/server/utils/auth';
import { hasAdminRole } from '#shared/utils/auth';


export async function assertAdmin(event: any) {
  const user = await getOptionalUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — user not logged in',
    });
  }

  if (!hasAdminRole(user)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — admin access only',
    });
  }

  return user;
}
