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

export async function msFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${MS_BASE}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getMoyskladToken()}`,
      'Accept-Encoding': 'gzip',
      Accept: 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    throw createError({
      statusCode: 502,
      statusMessage: `MoySklad ${response.status} on ${path}: ${text.slice(0, 500)}`,
    });
  }

  return response.json() as Promise<T>;
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
