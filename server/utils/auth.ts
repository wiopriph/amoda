import { serverSupabaseUser } from '#supabase/server';
import type { H3Event } from 'h3';


// serverSupabaseUser бросает 500 «Auth session missing» без куки — для нас это просто «гость»
export const getOptionalUser = async (event: H3Event) => serverSupabaseUser(event).catch(() => null);
