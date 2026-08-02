import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';
import { msListProductVariants } from '~~/server/utils/moysklad';


type ProductRow = {
  id: number;
  title: string;
  'ms_product_id': string;
};

type SizeRow = {
  id: number;
  size: string;
  'ms_code': string | null;
  'ms_variant_id': string | null;
  'product_variants': { color: string | null; 'product_id': number };
};

// Сверка покрытия: какие модификации МС не привязаны ни к одному размеру
// на сайте (новый цвет/размер на складе) и наоборот
export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const { data: products, error: productsError } = await client
    .from('products')
    .select('id, title, ms_product_id')
    .not('ms_product_id', 'is', null)
    .order('id') as { data: ProductRow[] | null; error: any };

  if (productsError) {
    throw createError({ statusCode: 500, statusMessage: productsError.message });
  }

  const { data: sizes, error: sizesError } = await client
    .from('product_variant_sizes')
    .select('id, size, ms_code, ms_variant_id, product_variants!inner(color, product_id)') as {
    data: SizeRow[] | null;
    error: any;
  };

  if (sizesError) {
    throw createError({ statusCode: 500, statusMessage: sizesError.message });
  }

  const sizesByProductId = new Map<number, SizeRow[]>();

  for (const size of sizes ?? []) {
    const productId = size['product_variants']['product_id'];

    if (!sizesByProductId.has(productId)) {
      sizesByProductId.set(productId, []);
    }

    sizesByProductId.get(productId)!.push(size);
  }

  type ProductReport = {
    productId: number;
    title: string;
    msVariantsTotal: number;
    // Модификации МС без пары на сайте — новый цвет/размер на складе
    missingOnSite: { id: string; name: string; code: string | null; characteristics: string }[];
    // Размеры сайта без привязки к МС; foreignCode — старый ms_code,
    // которого нет среди модификаций привязанного товара (обычно цвет
    // заведён в МС отдельной карточкой либо код устарел)
    unlinkedLocalSizes: { sizeId: number; color: string | null; size: string; msCode: string | null; foreignCode: boolean }[];
    // Привязка указывает на модификацию, которой нет у этого товара МС
    brokenLinks: { sizeId: number; color: string | null; size: string; msVariantId: string }[];
    error?: string;
  };

  const report: ProductReport[] = [];

  for (const product of products ?? []) {
    const localSizes = sizesByProductId.get(product.id) ?? [];

    const base: ProductReport = {
      productId: product.id,
      title: product.title,
      msVariantsTotal: 0,
      missingOnSite: [],
      unlinkedLocalSizes: [],
      brokenLinks: [],
    };

    let msVariants;

    try {
      msVariants = await msListProductVariants(product['ms_product_id']);
    } catch (error: any) {
      base.error = error?.statusMessage || error?.message || 'MoySklad request failed';
      report.push(base);
      continue;
    }

    base.msVariantsTotal = msVariants.length;

    const linkedMsIds = new Set(
      localSizes
        .map(size => size['ms_variant_id'])
        .filter((id): id is string => Boolean(id)),
    );

    const msIds = new Set(msVariants.map(v => v.id));
    const msCodes = new Set(msVariants.map(v => v.code).filter((code): code is string => Boolean(code)));

    base.missingOnSite = msVariants
      .filter(v => !linkedMsIds.has(v.id))
      .map(v => ({
        id: v.id,
        name: v.name,
        code: v.code,
        characteristics: v.characteristics.map(c => c.value).join(' / '),
      }));

    base.unlinkedLocalSizes = localSizes
      .filter(size => !size['ms_variant_id'])
      .map((size) => {
        const msCode = size['ms_code']?.trim() || null;

        return {
          sizeId: size.id,
          color: size['product_variants'].color,
          size: size.size,
          msCode,
          foreignCode: Boolean(msCode && !msCodes.has(msCode)),
        };
      });

    base.brokenLinks = localSizes
      .filter(size => size['ms_variant_id'] && !msIds.has(size['ms_variant_id']))
      .map(size => ({
        sizeId: size.id,
        color: size['product_variants'].color,
        size: size.size,
        msVariantId: size['ms_variant_id']!,
      }));

    if (base.missingOnSite.length || base.unlinkedLocalSizes.length || base.brokenLinks.length) {
      report.push(base);
    }
  }

  return {
    ok: true,
    checkedProducts: products?.length ?? 0,
    productsWithIssues: report.length,
    report,
  };
});
