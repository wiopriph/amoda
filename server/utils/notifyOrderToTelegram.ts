import { serverSupabaseServiceRole } from '#supabase/server';
import { sendTelegramMessage } from '~~/server/utils/telegram';


type NotifyOrderPayload = {
  id: string | number;
  number: string | number;
  createdAt: string;
};

export async function notifyOrderToTelegram(
  event: Parameters<typeof serverSupabaseServiceRole>[0],
  order: NotifyOrderPayload,
) {
  const client = await serverSupabaseServiceRole(event);

  const { data: subscribers, error } = await client
    .from('telegram_subscribers')
    .select('telegram_chat_id')
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  const adminBaseUrl = process.env.NUXT_PUBLIC_ADMIN_BASE_URL;

  if (!adminBaseUrl) {
    throw new Error('NUXT_PUBLIC_ADMIN_BASE_URL is not set');
  }

  const date = new Date(order.createdAt);

  const dateStr = date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeStr = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const adminUrl = `${adminBaseUrl}/orders/${order.id}`;

  const text = [
    '🛍 Новый заказ',
    '',
    `Дата: ${dateStr}`,
    `Время: ${timeStr}`,
    `Заказ: #${order.number}`,
    '',
    `Ссылка: ${adminUrl}`,
  ].join('\n');

  for (const subscriber of subscribers || []) {
    try {
      await sendTelegramMessage(subscriber.telegram_chat_id, text);
    } catch (error) {
      console.error('Telegram notify failed', subscriber.telegram_chat_id, error);
    }
  }
}
