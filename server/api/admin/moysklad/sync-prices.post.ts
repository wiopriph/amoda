import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


const MS_BASE = 'https://api.moysklad.ru/api/remap/1.2';

type LocalVariantRow = {
  id: number;
  price: number | null;
  product_variant_sizes: { ms_code: string | null }[];
};

type UpdateRow = {
  id: number;
  price: number;
};

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const config = useRuntimeConfig();
  const token = config.moyskladToken;

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'MOYSKLAD_TOKEN is missing' });
  }

  const client = await serverSupabaseServiceRole(event);

  // 1. Fetch all MS modifications → code -> sale price (in whole Kz)
  const priceByCode = new Map<string, number>();

  let offset = 0;
  const limit = 1000;

  while (true) {
    const url = new URL(`${MS_BASE}/entity/assortment`);

    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('type', 'variant');

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
      throw createError({ statusCode: 502, statusMessage: `MoySklad error: ${res.status}` });
    }

    const data = await res.json();
    const rows: any[] = data.rows ?? [];

    for (const r of rows) {
      const code = r.code?.trim();

      if (!code) {
        continue;
      }

      // MoySklad money is in minor units (×100); site prices are whole Kz
      const valueMinor = Number(r.salePrices?.[0]?.value ?? 0);

      if (valueMinor > 0) {
        priceByCode.set(code, Math.round(valueMinor / 100));
      }
    }

    if (rows.length < limit) {
      break;
    }

    offset += limit;
  }

  // 2. Local variants that have at least one size linked to MS
  const { data: variants, error: variantsError } = await client
    .from('product_variants')
    .select('id, price, product_variant_sizes!inner(ms_code)')
    .not('product_variant_sizes.ms_code', 'is', null) as {
    data: LocalVariantRow[] | null;
    error: any;
  };

  if (variantsError) {
    throw createError({ statusCode: 500, statusMessage: variantsError.message });
  }

  const updates: UpdateRow[] = [];
  const conflicts: { variantId: number; prices: number[] }[] = [];

  let skippedNoMsPrice = 0;

  for (const variant of variants ?? []) {
    const codes = (variant.product_variant_sizes ?? [])
      .map(s => s.ms_code?.trim())
      .filter((c): c is string => Boolean(c));

    const prices = [...new Set(
      codes
        .map(code => priceByCode.get(code))
        .filter((p): p is number => typeof p === 'number'),
    )];

    if (!prices.length) {
      skippedNoMsPrice++;
      continue;
    }

    // Sizes of one colour should share a price; if they differ, take the
    // highest and flag it for manual review
    if (prices.length > 1) {
      conflicts.push({ variantId: variant.id, prices });
    }

    const nextPrice = Math.max(...prices);

    if (Number(variant.price ?? -1) !== nextPrice) {
      updates.push({ id: variant.id, price: nextPrice });
    }
  }

  if (updates.length) {
    const { error } = await client
      .from('product_variants')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  }

  return {
    success: true,
    totalLinkedVariants: variants?.length ?? 0,
    updated: updates.length,
    skippedNoMsPrice,
    conflicts,
  };
});
