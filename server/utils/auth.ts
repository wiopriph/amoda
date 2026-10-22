import { serverSupabaseUser } from '#supabase/server';
import type { H3Event } from 'h3';


// serverSupabaseUser бросает 500 «Auth session missing» без куки — для нас это просто «гость».
// С @nuxtjs/supabase v2 он возвращает JWT-claims, где id пользователя лежит в `sub` —
// нормализуем в `id`, на который завязан весь серверный код.
export const getOptionalUser = async (event: H3Event) => {
  const claims: any = await serverSupabaseUser(event).catch(() => null);

  const id = claims?.id ?? claims?.sub;

  if (!id) {
    return null;
  }

  return { ...claims, id };
};
