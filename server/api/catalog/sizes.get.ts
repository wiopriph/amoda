import { serverSupabaseClient } from '#supabase/server';


const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from('product_variant_sizes')
    .select('size');

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const unique = [...new Set((data ?? []).map((row: any) => String(row.size).trim().toUpperCase()).filter(Boolean))];

  unique.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);

    if (ai !== -1 && bi !== -1) return ai - bi;

    if (ai !== -1) return -1;

    if (bi !== -1) return 1;

    return a.localeCompare(b, undefined, { numeric: true });
  });

  return unique;
});
