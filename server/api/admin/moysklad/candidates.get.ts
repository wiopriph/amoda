import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


const MS_BASE = 'https://api.moysklad.ru/api/remap/1.2';

type MsVariant = {
  msCode: string
  productName: string
  color: string
  size: string
  price: number
  msProductUrl: string | null
};

type LocalSize = {
  id: number
  msCode: string | null
  size: string
  variantColor: string
  productTitle: string
  productSlug: string
  productId: number
  variantId: number
  imageUrl: string | null
};

function normalize(s: string) {
  return s.toLowerCase().trim()
    .replace(/\s+/g, ' ');
}

function matchScore(ms: MsVariant, local: LocalSize): number {
  const msProduct = normalize(ms.productName);
  const localProduct = normalize(local.productTitle);
  const msColor = normalize(ms.color);
  const localColor = normalize(local.variantColor);
  const msSize = normalize(ms.size);
  const localSize = normalize(local.size);

  let score = 0;

  // Size must match exactly (most reliable)
  if (msSize !== localSize) return 0;

  // Color match
  if (msColor === localColor) score += 40;
  else if (msColor.includes(localColor) || localColor.includes(msColor)) score += 20;
  else return 0;

  // Product name match
  if (msProduct === localProduct) {
    score += 60;
  } else {
    // Count how many words overlap
    const msWords = new Set(msProduct.split(' ').filter(w => w.length > 3));
    const localWords = localProduct.split(' ').filter(w => w.length > 3);
    const overlap = localWords.filter(w => msWords.has(w)).length;
    const ratio = overlap / Math.max(msWords.size, localWords.length, 1);

    score += Math.round(ratio * 60);
  }

  return score;
}

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const config = useRuntimeConfig();
  const token = config.moyskladToken;
  const client = await serverSupabaseServiceRole(event);

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'MOYSKLAD_TOKEN is missing' });
  }

  // Fetch all MS variants
  const msVariants: MsVariant[] = [];

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
      if (r.meta?.type !== 'variant') continue;

      const code = r.code?.trim();

      if (!code) continue;

      const size = r.characteristics?.find((c: any) => c.name === 'Tamanho')?.value ?? '';
      const color = r.characteristics?.find((c: any) => c.name === 'Cor')?.value ?? '';
      const productName = r.product?.name ?? r.name;
      const price = r.salePrices?.[0]?.value ?? 0;

      // Build link to the parent product in MoySklad web UI
      const productHref: string = r.product?.meta?.href ?? '';
      const productUuidMatch = productHref.match(/\/entity\/product\/([a-f0-9-]+)/i);
      const msProductUrl = productUuidMatch
        ? `https://online.moysklad.ru/app/#good/edit?id=${productUuidMatch[1]}`
        : null;

      msVariants.push({ msCode: code, productName, color, size, price, msProductUrl });
    }

    if (rows.length < limit) break;

    offset += limit;
  }

  // Fetch local unlinked sizes with context
  const { data: localSizes, error } = await client
    .from('product_variant_sizes')
    .select(`
      id,
      ms_code,
      size,
      product_variants!inner (
        id,
        color,
        product_variant_images ( url, position ),
        products!inner ( id, title, slug )
      )
    `)
    .order('id');

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const local: LocalSize[] = (localSizes ?? []).map((row: any) => {
    const images: { url: string; position: number | null }[] = row.product_variants?.product_variant_images ?? [];
    const sorted = images.slice().sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

    return {
      id: row.id,
      msCode: row.ms_code ?? null,
      size: row.size,
      variantColor: row.product_variants?.color ?? '',
      productTitle: row.product_variants?.products?.title ?? '',
      productSlug: row.product_variants?.products?.slug ?? '',
      productId: row.product_variants?.products?.id ?? 0,
      variantId: row.product_variants?.id ?? 0,
      imageUrl: sorted[0]?.url ?? null,
    };
  });

  // Auto-match unlinked local sizes against MS variants
  const alreadyLinked = local.filter(l => l.msCode);
  const unlinked = local.filter(l => !l.msCode);

    type Suggestion = {
      localId: number
      localSize: string
      localColor: string
      localProduct: string
      localProductSlug: string
      imageUrl: string | null
      variantId: number
      productId: number
      currentMsCode: string | null
      suggestion: (MsVariant & { score: number }) | null
      alternatives: (MsVariant & { score: number })[]
    };

    const suggestions: Suggestion[] = unlinked.map((loc) => {
      const scored = msVariants
        .map(ms => ({ ...ms, score: matchScore(ms, loc) }))
        .filter(ms => ms.score > 0)
        .sort((a, b) => b.score - a.score);

      return {
        localId: loc.id,
        localSize: loc.size,
        localColor: loc.variantColor,
        localProduct: loc.productTitle,
        localProductSlug: loc.productSlug,
        imageUrl: loc.imageUrl,
        variantId: loc.variantId,
        productId: loc.productId,
        currentMsCode: null,
        suggestion: scored[0] ?? null,
        alternatives: scored.slice(1, 4),
      };
    });

    return {
      msVariants,
      alreadyLinked: alreadyLinked.map(l => ({
        localId: l.id,
        localSize: l.size,
        localColor: l.variantColor,
        localProduct: l.productTitle,
        localProductSlug: l.productSlug,
        imageUrl: l.imageUrl,
        variantId: l.variantId,
        productId: l.productId,
        currentMsCode: l.msCode,
      })),
      suggestions,
      stats: {
        totalMs: msVariants.length,
        totalLocal: local.length,
        linked: alreadyLinked.length,
        unlinked: unlinked.length,
        autoMatched: suggestions.filter(s => s.suggestion && s.suggestion.score >= 80).length,
      },
    };
});
