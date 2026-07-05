import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


type MoyskladStockRow = {
  name: string;
  code?: string;
  stock?: number;
  reserve?: number;
  quantity?: number;
};

type MoyskladStockResponse = {
  rows?: MoyskladStockRow[];
};

type LocalSizeRow = {
  id: number;
  ms_code: string | null;
  stock: number | null;
};

type UpdateRow = {
  id: number;
  stock: number;
};

const moyskladBaseUrl = 'https://api.moysklad.ru/api/remap/1.2';

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const config = useRuntimeConfig();
  const client = await serverSupabaseServiceRole(event);

  const token = config.moyskladToken;

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MOYSKLAD_TOKEN is missing',
    });
  }

  const { data: localSizes, error: localError } = await client
    .from('product_variant_sizes')
    .select('id, ms_code, stock')
    .not('ms_code', 'is', null) as {
    data: LocalSizeRow[] | null;
    error: any;
  };

  if (localError) {
    throw createError({
      statusCode: 500,
      statusMessage: localError.message,
    });
  }

  const localByCode = new Map<string, LocalSizeRow>();

  for (const size of localSizes ?? []) {
    const code = size.ms_code?.trim();

    if (code) {
      localByCode.set(code, size);
    }
  }

  const limit = 1000;

  let offset = 0;

  let totalFromMoysklad = 0;
  let skippedWithoutCode = 0;
  let skippedNotFound = 0;

  const updates: UpdateRow[] = [];
  const matchedCodes = new Set<string>();

  while (true) {
    const url = new URL(`${moyskladBaseUrl}/report/stock/all`);

    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('include', 'zeroLines');

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;charset=utf-8',
      },
    });

    if (!response.ok) {
      const text = await response.text();

      throw createError({
        statusCode: response.status,
        statusMessage: `Moysklad error: ${text}`,
      });
    }

    const data = (await response.json()) as MoyskladStockResponse;
    const rows = data.rows ?? [];

    totalFromMoysklad += rows.length;

    for (const row of rows) {
      const code = row.code?.trim();

      if (!code) {
        skippedWithoutCode++;
        continue;
      }

      const localSize = localByCode.get(code);

      if (!localSize) {
        skippedNotFound++;
        continue;
      }

      matchedCodes.add(code);

      // Sellable stock: physical stock minus what is reserved for other orders
      const available = Math.max(0, Number(row.stock ?? 0) - Number(row.reserve ?? 0));

      // Skip rows that already have the right value to keep the upsert small
      if (Number(localSize.stock ?? -1) !== available) {
        updates.push({
          id: localSize.id,
          stock: available,
        });
      }
    }

    if (rows.length < limit) {
      break;
    }

    offset += limit;
  }

  if (updates.length) {
    const { error } = await client
      .from('product_variant_sizes')
      .upsert(updates, {
        onConflict: 'id',
      });

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
  }

  // Linked local sizes whose ms_code never appeared in the MS report —
  // stale codes worth reviewing in the admin
  const localCodesNotInMoysklad = [...localByCode.keys()].filter(code => !matchedCodes.has(code));

  return {
    success: true,
    totalFromMoysklad,
    totalLinkedLocalSizes: localSizes?.length ?? 0,
    updated: updates.length,
    skippedWithoutCode,
    skippedNotFound,
    localCodesNotInMoysklad,
  };
});
