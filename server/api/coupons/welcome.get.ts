import { serverSupabaseServiceRole } from '#supabase/server';
import { couponSummary } from '~~/server/utils/coupons';


// Для блока-стимула гостю в корзине: какой купон ждёт после регистрации
export default defineCachedEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event) as any;

  const { data } = await client
    .from('coupons')
    .select('code, discount_type, value')
    .eq('note', 'welcome')
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  return data ? couponSummary(data) : null;
}, { maxAge: 300 });
