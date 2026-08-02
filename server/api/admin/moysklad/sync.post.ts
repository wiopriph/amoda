import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { msFetch, msFetchAllRows, msMoneyToPrice } from '~~/server/utils/moysklad';


type LocalSizeRow = {
  id: number;
  'ms_variant_id': string;
  stock: number | null;
};

type LocalVariantRow = {
  id: number;
  price: number | null;
  'product_variant_sizes': { 'ms_variant_id': string | null }[];
};

// Строка краткого отчёта: поле со значением называется как stockType
type MsCurrentStockRow = {
  assortmentId: string;
  freeStock?: number;
  stock?: number;
  quantity?: number;
};

export default defineEventHandler(async (event) => {
  // Для планировщика (pg_cron и т.п.): заголовок x-sync-token вместо админской сессии
  const syncToken = useRuntimeConfig().moyskladSyncToken;
  const headerToken = getHeader(event, 'x-sync-token');

  if (!syncToken || headerToken !== syncToken) {
    await assertAdmin(event);
  }

  const client = await serverSupabaseServiceRole(event);

  // --- Остатки ---

  const { data: sizes, error: sizesError } = await client
    .from('product_variant_sizes')
    .select('id, ms_variant_id, stock')
    .not('ms_variant_id', 'is', null) as { data: LocalSizeRow[] | null; error: any };

  if (sizesError) {
    throw createError({ statusCode: 500, statusMessage: sizesError.message });
  }

  const linkedSizes = sizes ?? [];

  // freeStock = физический остаток минус резерв; zeroLines — чтобы обнулять распроданное
  const stockReport = await msFetch<MsCurrentStockRow[]>('/report/stock/all/current', {
    stockType: 'freeStock',
    include: 'zeroLines',
  });

  const stockByMsId = new Map<string, number>();

  for (const row of stockReport) {
    const value = Number(row.freeStock ?? row.stock ?? row.quantity ?? 0);

    stockByMsId.set(row.assortmentId, Math.max(0, Math.round(value)));
  }

  const stockUpdates: { id: number; stock: number }[] = [];
  const staleLinks: number[] = [];

  for (const size of linkedSizes) {
    const nextStock = stockByMsId.get(size['ms_variant_id']);

    // Товар без единой операции в МС не попадает даже в zeroLines
    if (nextStock === undefined) {
      staleLinks.push(size.id);
      continue;
    }

    if (Number(size.stock ?? -1) !== nextStock) {
      stockUpdates.push({ id: size.id, stock: nextStock });
    }
  }

  if (stockUpdates.length) {
    const { error } = await client
      .from('product_variant_sizes')
      .upsert(stockUpdates, { onConflict: 'id' });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  }

  // --- Цены ---

  const assortment = await msFetchAllRows<any>('/entity/assortment');

  const productPriceById = new Map<string, number>();
  const variantPriceById = new Map<string, number>();
  const variantProductById = new Map<string, string>();

  for (const row of assortment) {
    const type = row.meta?.type;
    const price = msMoneyToPrice(row.salePrices?.[0]?.value);

    if (type === 'product' && price !== null) {
      productPriceById.set(String(row.id), price);
    }

    if (type === 'variant') {
      if (price !== null) {
        variantPriceById.set(String(row.id), price);
      }

      const productHref: string | undefined = row.product?.meta?.href;

      if (productHref) {
        variantProductById.set(String(row.id), productHref.split('/').pop()!.split('?')[0]!);
      }
    }
  }

  // Цена модификации; если своей нет — наследуется от товара МС
  const priceForMsVariant = (msVariantId: string): number | null => {
    const own = variantPriceById.get(msVariantId);

    if (own !== undefined) {
      return own;
    }

    const productId = variantProductById.get(msVariantId);

    return productId !== undefined ? productPriceById.get(productId) ?? null : null;
  };

  const { data: variants, error: variantsError } = await client
    .from('product_variants')
    .select('id, price, product_variant_sizes!inner(ms_variant_id)')
    .not('product_variant_sizes.ms_variant_id', 'is', null) as {
    data: LocalVariantRow[] | null;
    error: any;
  };

  if (variantsError) {
    throw createError({ statusCode: 500, statusMessage: variantsError.message });
  }

  const priceUpdates: { id: number; price: number }[] = [];
  const priceConflicts: { variantId: number; prices: number[] }[] = [];

  let skippedNoMsPrice = 0;

  for (const variant of variants ?? []) {
    const prices = [...new Set(
      variant['product_variant_sizes']
        .map(size => size['ms_variant_id'])
        .filter((id): id is string => Boolean(id))
        .map(priceForMsVariant)
        .filter((price): price is number => price !== null),
    )];

    if (!prices.length) {
      skippedNoMsPrice++;
      continue;
    }

    // Размеры одного цвета должны стоить одинаково; при расхождении берём максимум и помечаем
    if (prices.length > 1) {
      priceConflicts.push({ variantId: variant.id, prices });
    }

    const nextPrice = Math.max(...prices);

    if (Number(variant.price ?? -1) !== nextPrice) {
      priceUpdates.push({ id: variant.id, price: nextPrice });
    }
  }

  if (priceUpdates.length) {
    const { error } = await client
      .from('product_variants')
      .upsert(priceUpdates, { onConflict: 'id' });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  }

  return {
    ok: true,
    stock: {
      linkedSizes: linkedSizes.length,
      updated: stockUpdates.length,
      staleLinks,
    },
    prices: {
      linkedVariants: variants?.length ?? 0,
      updated: priceUpdates.length,
      conflicts: priceConflicts,
      skippedNoMsPrice,
    },
  };
});
