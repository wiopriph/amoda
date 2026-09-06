import { assertAccount } from '~~/server/utils/assertAccount';
import { getOrCreateProfile } from '~~/server/utils/profile';


export default defineEventHandler(async (event) => {
  const user = await assertAccount(event);

  return getOrCreateProfile(event, user);
});
