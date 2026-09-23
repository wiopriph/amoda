import { serverSupabaseServiceRole } from '#supabase/server';
import { sendTelegramMessage } from '~~/server/utils/telegram';
import type { OrderTotals } from '#shared/constants/coupons';


type NotifyOrderPayload = {
  id: string | number;
  number: string | number;
  createdAt: string;
  totals?: OrderTotals;
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

  const adminUrl = `https://amoda.ao/admin/orders/${order.number}`;

  const kz = (value: number) => `${value.toLocaleString('ru-RU')} kz`;
  const totalsLines: string[] = [];

  if (order.totals) {
    if (order.totals.discount > 0 && order.totals.coupon) {
      totalsLines.push(`Вещи: ${kz(order.totals.subtotal)}`, `Купон ${order.totals.coupon.code}: −${kz(order.totals.discount)}`);
    }

    totalsLines.push(`Итого: ${kz(order.totals.total)}`);
  }

  const text = [
    '🛍 Новый заказ',
    '',
    `Дата: ${dateStr}`,
    `Время: ${timeStr}`,
    `Заказ: #${order.number}`,
    ...totalsLines,
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
