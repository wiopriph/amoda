import { serverSupabaseServiceRole } from '#supabase/server';
import { sendTelegramMessage } from '~~/server/utils/telegram';


type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: {
      id: number;
    };
    from?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody<TelegramUpdate>(event);
  const message = body?.message;

  if (!message?.chat?.id || !message?.from?.id) {
    return { ok: true };
  }

  const client = await serverSupabaseServiceRole(event);

  const chatId = message.chat.id;
  const text = (message.text || '').trim();

  if (text === '/start') {
    const { error } = await client
      .from('telegram_subscribers')
      .upsert(
        {
          telegram_user_id: message.from.id,
          telegram_chat_id: message.chat.id,
          username: message.from.username ?? null,
          first_name: message.from.first_name ?? null,
          last_name: message.from.last_name ?? null,
          is_active: true,
        },
        {
          onConflict: 'telegram_user_id',
        },
      );

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }

    await sendTelegramMessage(
      chatId,
      'Готово. Теперь ты будешь получать уведомления о новых заказах.',
    );
  }

  if (text === '/stop') {
    const { error } = await client
      .from('telegram_subscribers')
      .update({ is_active: false })
      .eq('telegram_chat_id', chatId);

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }

    await sendTelegramMessage(chatId, 'Ок. Уведомления отключены.');
  }

  return { ok: true };
});
