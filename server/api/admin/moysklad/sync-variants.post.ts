import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


const MS_BASE = 'https://api.moysklad.ru/api/remap/1.2';

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const config = useRuntimeConfig();
  const token = config.moyskladToken;

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'MOYSKLAD_TOKEN is missing' });
  }

  const client = await serverSupabaseServiceRole(event);

  // Fetch all local products with ms_product_id
  const { data: products, error: prodError } = await client
    .from('products')
    .select('id, title, ms_product_id')
    .not('ms_product_id', 'is', null);

  if (prodError) {
    throw createError({ statusCode: 500, statusMessage: prodError.message });
  }

  if (!products?.length) {
    return { ok: true, updated: 0, message: 'No products linked to MoySklad' };
  }

  // Fetch all local sizes with variant color info
  const { data: localSizes, error: sizesError } = await client
    .from('product_variant_sizes')
    .select(`
      id,
      size,
      product_variants!inner (
        id,
        color,
        products!inner ( id, ms_product_id )
      )
    `)
    .not('product_variants.products.ms_product_id', 'is', null);

  if (sizesError) {
    throw createError({ statusCode: 500, statusMessage: sizesError.message });
  }

  // Build map: ms_product_id → local sizes
  const productSizesMap = new Map<string, { id: number; size: string; color: string }[]>();

  for (const row of (localSizes ?? []) as any[]) {
    const msId: string = row.product_variants?.products?.ms_product_id;

    if (!msId) continue;

    if (!productSizesMap.has(msId)) productSizesMap.set(msId, []);

    productSizesMap.get(msId)!.push({
      id: row.id,
      size: normalize(row.size),
      color: normalize(row.product_variants?.color ?? ''),
    });
  }

  const updates: { id: number; ms_code: string }[] = [];

  // For each linked product, fetch MS variants and match
  for (const product of products) {
    const msId = product.ms_product_id as string;
    const localEntries = productSizesMap.get(msId) ?? [];

    if (!localEntries.length) continue;

    const url = `${MS_BASE}/entity/product/${msId}/variants?limit=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) continue;

    const data = await res.json();
    const msVariants: any[] = data.rows ?? [];

    for (const msVar of msVariants) {
      const code = msVar.code?.trim();

      if (!code) continue;

      const msSize = normalize(msVar.characteristics?.find((c: any) => c.name === 'Tamanho')?.value ?? '');
      const msColor = normalize(msVar.characteristics?.find((c: any) => c.name === 'Cor')?.value ?? '');

      const match = localEntries.find(loc =>
        loc.size === msSize && (loc.color === msColor || msColor.includes(loc.color) || loc.color.includes(msColor)),
      );

      if (match) {
        updates.push({ id: match.id, ms_code: code });
      }
    }
  }

  if (updates.length) {
    const { error: upsertError } = await client
      .from('product_variant_sizes')
      .upsert(updates, { onConflict: 'id' });

    if (upsertError) {
      throw createError({ statusCode: 500, statusMessage: upsertError.message });
    }
  }

  return { ok: true, updated: updates.length, productsProcessed: products.length };
});
