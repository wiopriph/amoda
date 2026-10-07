import { getOptionalUser } from '~~/server/utils/auth';


export async function assertAccount(event: any) {
  const user = await getOptionalUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized — user not logged in' });
  }

  return user;
}
