const MS_BASE = 'https://api.moysklad.ru/api/remap/1.2';

export type MsVariantRow = {
  id: string;
  name: string;
  code: string | null;
  characteristics: { name: string; value: string }[];
  salePrice: number | null;
};

export function getMoyskladToken(): string {
  const token = useRuntimeConfig().moyskladToken;

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'MOYSKLAD_TOKEN is missing' });
  }

  return token;
}

const MS_REQUEST_TIMEOUT_MS = 30_000;

export async function msFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${MS_BASE}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  // Сетевые сбои undici всплывают как безликий «Server Error» — оборачиваем
  // в понятную ошибку с эндпоинтом и причиной; один повтор на случай тарпита
  for (let attempt = 1; ; attempt++) {
    const startedAt = Date.now();

    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getMoyskladToken()}`,
          'Accept-Encoding': 'gzip',
          Accept: 'application/json;charset=utf-8',
        },
        signal: AbortSignal.timeout(MS_REQUEST_TIMEOUT_MS),
      });
    } catch (error: any) {
      const cause = error?.cause?.code || error?.name || error?.message || 'unknown';
      const elapsed = Math.round((Date.now() - startedAt) / 1000);

      console.error(`[moysklad] ${path} attempt ${attempt} failed after ${elapsed}s: ${cause}`);

      if (attempt < 2) {
        continue;
      }

      throw createError({
        statusCode: 502,
        statusMessage: `MoySklad network failure on ${path} after ${elapsed}s: ${cause}`,
      });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');

      throw createError({
        statusCode: 502,
        statusMessage: `MoySklad ${response.status} on ${path}: ${text.slice(0, 500)}`,
      });
    }

    return response.json() as Promise<T>;
  }
}

// Постраничный обход списочных эндпоинтов ({ rows: [...] })
export async function msFetchAllRows<T>(path: string, params?: Record<string, string>): Promise<T[]> {
  const limit = 1000;
  const rows: T[] = [];

  let offset = 0;

  while (true) {
    const data = await msFetch<{ rows?: T[] }>(path, {
      ...params,
      limit: String(limit),
      offset: String(offset),
    });

    const page = data.rows ?? [];

    rows.push(...page);

    if (page.length < limit) {
      break;
    }

    offset += limit;
  }

  return rows;
}

// МойСклад хранит деньги в копейках, на сайте цены целые
export function msMoneyToPrice(valueMinor: unknown): number | null {
  const value = Number(valueMinor);

  return Number.isFinite(value) && value > 0 ? Math.round(value / 100) : null;
}

// Расширение сохраняет id товара из адресной строки UI (#good/edit?id=...),
// который отличается от id в JSON API. GET товара принимает оба и отдаёт канонический.
export async function msResolveProductId(msProductId: string): Promise<string> {
  const product = await msFetch<{ id: string }>(`/entity/product/${msProductId}`);

  return product.id;
}

// Модификации одного товара МойСклад; принимает и UI-id, и API-id товара
export async function msListProductVariants(msProductId: string): Promise<MsVariantRow[]> {
  const rows = await msFetchAllRows<any>('/entity/variant', {
    filter: `productid=${await msResolveProductId(msProductId)}`,
  });

  return rows.map(row => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    code: row.code?.trim() || null,
    characteristics: (row.characteristics ?? []).map((c: any) => ({
      name: String(c.name ?? ''),
      value: String(c.value ?? ''),
    })),
    salePrice: msMoneyToPrice(row.salePrices?.[0]?.value),
  }));
}

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
