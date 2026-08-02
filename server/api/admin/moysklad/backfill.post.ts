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
  'ms_code': string | null;
  'ms_variant_id': string | null;
  'product_variants': { 'product_id': number };
};

// Одноразовый перенос старых привязок: ms_code -> ms_variant_id (UUID)
export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const { data: products, error: productsError } = await client
    .from('products')
    .select('id, title, ms_product_id')
    .not('ms_product_id', 'is', null) as { data: ProductRow[] | null; error: any };

  if (productsError) {
    throw createError({ statusCode: 500, statusMessage: productsError.message });
  }

  const { data: sizes, error: sizesError } = await client
    .from('product_variant_sizes')
    .select('id, ms_code, ms_variant_id, product_variants!inner(product_id)')
    .not('ms_code', 'is', null)
    .is('ms_variant_id', null) as { data: SizeRow[] | null; error: any };

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

  const updates: { id: number; 'ms_variant_id': string }[] = [];
  const unmatched: { productId: number; title: string; codes: string[] }[] = [];

  for (const product of products ?? []) {
    const productSizes = sizesByProductId.get(product.id) ?? [];

    if (!productSizes.length) {
      continue;
    }

    const msVariants = await msListProductVariants(product['ms_product_id']);
    const msIdByCode = new Map(
      msVariants
        .filter(v => v.code)
        .map(v => [v.code as string, v.id]),
    );

    const missingCodes: string[] = [];

    for (const size of productSizes) {
      const code = size['ms_code']?.trim();

      if (!code) {
        continue;
      }

      const msVariantId = msIdByCode.get(code);

      if (msVariantId) {
        updates.push({ id: size.id, 'ms_variant_id': msVariantId });
      } else {
        missingCodes.push(code);
      }
    }

    if (missingCodes.length) {
      unmatched.push({ productId: product.id, title: product.title, codes: missingCodes });
    }
  }

  if (updates.length) {
    const { error } = await client
      .from('product_variant_sizes')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  }

  return {
    ok: true,
    linkedProducts: products?.length ?? 0,
    sizesWithCodeOnly: sizes?.length ?? 0,
    filled: updates.length,
    unmatched,
  };
});
