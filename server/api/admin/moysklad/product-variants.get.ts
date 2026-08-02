import { assertAdmin } from '~~/server/utils/assertAdmin';
import { isValidUuid, msListProductVariants } from '~~/server/utils/moysklad';


// Модификации товара МойСклад для выбора привязки размера в форме товара
export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const { msProductId } = getQuery(event) as { msProductId?: string };

  if (!msProductId || !isValidUuid(msProductId)) {
    throw createError({ statusCode: 400, statusMessage: 'msProductId (UUID) is required' });
  }

  return msListProductVariants(msProductId);
});
