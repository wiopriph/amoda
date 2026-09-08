type SmsMessage = {
  to: string
  text: string
};

type SmsConfig = {
  provider: string
  senderId: string
  infobipBaseUrl?: string
  infobipApiKey?: string
};

const REQUEST_TIMEOUT_MS = 8000;

// Infobip: POST {baseUrl}/sms/2/text/advanced, Authorization: App <key>
const sendViaInfobip = async (config: SmsConfig, message: SmsMessage) => {
  if (!config.infobipBaseUrl || !config.infobipApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Infobip is not configured (INFOBIP_BASE_URL / INFOBIP_API_KEY)' });
  }

  const baseUrl = config.infobipBaseUrl.replace(/\/+$/, '');
  const url = /^https?:\/\//.test(baseUrl) ? `${baseUrl}/sms/2/text/advanced` : `https://${baseUrl}/sms/2/text/advanced`;

  const response = await $fetch<any>(url, {
    method: 'POST',
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Authorization: `App ${config.infobipApiKey}`,
      Accept: 'application/json',
    },
    body: {
      messages: [{
        from: config.senderId,
        destinations: [{ to: message.to }],
        text: message.text,
      }],
    },
  });

  const status = response?.messages?.[0]?.status;

  // groupId 1 = PENDING, 3 = DELIVERED; 2 = UNDELIVERABLE, 4 = EXPIRED, 5 = REJECTED
  if (status && ![1, 3].includes(Number(status.groupId))) {
    throw createError({ statusCode: 502, statusMessage: `Infobip rejected message: ${status.groupName} / ${status.name}` });
  }
};

// Для локальной разработки без провайдера: код уходит в лог сервера
const sendViaLog = async (_config: SmsConfig, message: SmsMessage) => {
  console.info(`[sms:log] to=${message.to} text="${message.text}"`);
};

const PROVIDERS: Record<string, (config: SmsConfig, message: SmsMessage) => Promise<void>> = {
  infobip: sendViaInfobip,
  log: sendViaLog,
};

export const sendSms = async (config: SmsConfig, message: SmsMessage) => {
  const send = PROVIDERS[config.provider];

  if (!send) {
    throw createError({ statusCode: 500, statusMessage: `Unknown SMS provider: ${config.provider}` });
  }

  await send(config, message);
};
