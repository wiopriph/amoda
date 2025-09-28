import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  gender?: { code: string }
}

type ProductVariantRow = {
  id: number
  sku: string | null
  size: string | null
  color: string | null
  price: number
  active: boolean | null
}

type ProductImageRow = {
  url: string
  sort: number | null
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { slug } = getQuery(event) as { slug?: string };

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' });
  }

  // 1) Грузим товар + бренд + варианты + изображения + primary_category с гендером
  const { data: productRow, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands ( id, name, slug ),
      variants:product_variants ( id, sku, size, color, price, active ),
      primary_category:categories!products_primary_category_id_fkey (
        id, name, slug, parent_id,
        gender:genders ( code )
      ),
      images:product_images ( url, sort )
    `)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (productError) {
    throw createError({ statusCode: 500, statusMessage: productError.message });
  }

  if (!productRow) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }

  // 2) Соберём цепочку родителей для primary_category (для крошек)
  const ancestorChain: CategoryRow[] = [];

  let cursorCategory = productRow.primary_category as CategoryRow | null;

  while (cursorCategory?.parent_id) {
    const { data: parentCategory, error: parentError } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('id', cursorCategory.parent_id)
      .maybeSingle();

    if (parentError) {
      throw createError({ statusCode: 500, statusMessage: parentError.message });
    }

    if (!parentCategory) {
      break;
    }

    ancestorChain.unshift(parentCategory as CategoryRow);
    cursorCategory = parentCategory as CategoryRow;
  }

  // 3) Финальная «тропинка» категорий: [родители..., текущая primary]
  const categoryTrail: CategoryRow[] = [];

  if (productRow.primary_category) {
    categoryTrail.push({
      id: productRow.primary_category.id,
      name: productRow.primary_category.name,
      slug: productRow.primary_category.slug,
      parent_id: productRow.primary_category.parent_id,
      gender: productRow.primary_category.gender, // { code }
    });
  }

  const categoriesTrail = [...ancestorChain, ...categoryTrail];

  // 4) Нормализуем изображения и варианты
  const imagesRaw = Array.isArray(productRow.images) ?
    (productRow.images as ProductImageRow[]) :
    (productRow.images ?
      [productRow.images as ProductImageRow] :
      []);

  const imagesSorted = imagesRaw.sort(
    (a, b) => (a?.sort ?? 0) - (b?.sort ?? 0),
  );

  const variantsFiltered = (productRow.variants as ProductVariantRow[] | null | undefined)?.filter(
    v => v.active !== false,
  ) ?? [];

  // 5) Хлебные крошки (именованные роуты → удобно для localeRoute)
  const genderCode = (productRow.primary_category as CategoryRow | null)?.gender?.code || 'women';

  const breadcrumbs = [
    {
      label: genderCode,
      to: { name: 'gender', params: { gender: genderCode } },
    },
    ...categoriesTrail.map(category => ({
      label: category.name,
      to: {
        name: 'gender-category',
        params: { gender: genderCode, category: category.slug },
      },
    })),
    {
      label: productRow.title,
      to: { name: 'product-slug', params: { slug: productRow.slug } },
    },
  ];

  // 6) Ответ
  return {
    product: {
      ...productRow,
      brand_name: productRow.brand?.name ?? null,
      brand_id: productRow.brand?.id ?? null,
      images: imagesSorted,
      variants: variantsFiltered,
    },
    breadcrumbs,
  };
});
