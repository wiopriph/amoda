import { createHmac, timingSafeEqual } from 'node:crypto';


const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

// Supabase Auth Hooks подписывают запрос по спецификации Standard Webhooks:
// HMAC-SHA256(secret, `${webhook-id}.${webhook-timestamp}.${body}`), секрет вида v1,whsec_<base64>
export const verifyStandardWebhook = (
  headers: Record<string, string | string[] | undefined>,
  rawBody: string,
  secret: string,
) => {
  const header = (name: string) => {
    const value = headers[name];

    return Array.isArray(value) ? value[0] : value;
  };

  const id = header('webhook-id');
  const timestamp = header('webhook-timestamp');
  const signatures = header('webhook-signature');

  if (!id || !timestamp || !signatures) {
    throw createError({ statusCode: 401, statusMessage: 'Missing webhook signature headers' });
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));

  if (!Number.isFinite(age) || age > TIMESTAMP_TOLERANCE_SECONDS) {
    throw createError({ statusCode: 401, statusMessage: 'Webhook timestamp out of tolerance' });
  }

  const key = Buffer.from(secret.replace(/^v1,/, '').replace(/^whsec_/, ''), 'base64');
  const expected = Buffer.from(
    createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`)
      .digest('base64'),
  );

  const isValid = signatures.split(' ').some((entry) => {
    const [version, signature] = entry.split(',');

    if (version !== 'v1' || !signature) {
      return false;
    }

    const actual = Buffer.from(signature);

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });

  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' });
  }
};
