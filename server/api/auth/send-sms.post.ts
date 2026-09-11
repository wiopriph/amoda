import { verifyStandardWebhook } from '~~/server/utils/standardWebhooks';
import { sendSms } from '~~/server/utils/sms';


type SendSmsHookPayload = {
  user?: { id?: string; phone?: string }
  sms?: { otp?: string }
};

// Supabase Auth → Send SMS Hook. Supabase сам генерирует код и считает лимиты, мы только доставляем.
export default defineEventHandler(async (event) => {
  const { smsHookSecret, sms } = useRuntimeConfig(event);

  if (!smsHookSecret) {
    throw createError({ statusCode: 500, statusMessage: 'SUPABASE_SMS_HOOK_SECRET is not set' });
  }

  const rawBody = (await readRawBody(event, 'utf8')) || '';

  verifyStandardWebhook(getRequestHeaders(event), rawBody, smsHookSecret);

  const payload = JSON.parse(rawBody) as SendSmsHookPayload;
  const phone = String(payload.user?.phone || '').replace(/\D/g, '');
  const otp = String(payload.sms?.otp || '');

  if (!phone || !/^\d{6}$/.test(otp)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid hook payload' });
  }

  await sendSms(sms, {
    to: phone,
    text: `Amoda: o teu código é ${otp}. Não partilhes este código com ninguém.`,
  });

  // Supabase проверяет content-type ответа: нужен JSON, иначе hook_payload_invalid_content_type
  return {};
});
