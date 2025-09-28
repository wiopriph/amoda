import { serverSupabaseClient } from '#supabase/server';


type QueryParams = {
  q?: string
  gender?: string
  slug?: string // категория или подкатегория
  brand_id?: string | number
  brand_slug?: string
  size?: string
  color?: string
  min_price?: string | number
  max_price?: string | number
  page?: string | number
  limit?: string | number
  sort?: 'price_asc' | 'price_desc' | 'new'
}

type Breadcrumb = {
  label: string
  to: { name: string; params: Record<string, string> }
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const query = getQuery(event) as QueryParams;

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(Number(query.limit || 24), 100);
  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  // === 0) gender_id (если задан gender)
  let genderId: number | null = null;

  if (query.gender) {
    const { data: genderRow, error: genderError } = await supabase
      .from('genders')
      .select('id, code')
      .eq('code', String(query.gender))
      .maybeSingle();

    if (genderError) {
      throw createError({ statusCode: 500, statusMessage: genderError.message });
    }

    if (!genderRow) {
      throw createError({ statusCode: 404, statusMessage: 'Gender not found' });
    }

    genderId = genderRow.id;
  }

  // === 1) category (если задан slug)
  let categoryId: number | null = null;
  let categoryGenderId: number | null = null;
  let currentCategory:
    | { id: number; name: string; slug: string; parent_id: number | null; gender_id: number }
    | null = null;

  if (query.slug) {
    const { data: categoryRow, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, gender_id')
      .eq('slug', String(query.slug))
      .maybeSingle();

    if (categoryError) {
      throw createError({ statusCode: 500, statusMessage: categoryError.message });
    }

    if (!categoryRow) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' });
    }

    if (genderId && categoryRow.gender_id !== genderId) {
      throw createError({ statusCode: 404, statusMessage: 'Category does not belong to this gender' });
    }

    currentCategory = categoryRow;
    categoryId = categoryRow.id;
    categoryGenderId = categoryRow.gender_id;
  }

  // === 2) хлебные крошки (именованные маршруты для localeRoute)
  const breadcrumbs: Breadcrumb[] = [];

  if (query.gender) {
    breadcrumbs.push({
      label: String(query.gender),
      to: { name: 'gender', params: { gender: String(query.gender) } },
    });
  }

  if (currentCategory) {
    // поднимаемся до родителя и «дедушки» (при необходимости)
    if (currentCategory.parent_id) {
      const { data: parentCategory } = await supabase
        .from('categories')
        .select('name, slug, parent_id')
        .eq('id', currentCategory.parent_id)
        .maybeSingle();

      if (parentCategory?.parent_id) {
        const { data: grandCategory } = await supabase
          .from('categories')
          .select('name, slug')
          .eq('id', parentCategory.parent_id)
          .maybeSingle();

        if (grandCategory) {
          breadcrumbs.push({
            label: grandCategory.name,
            to: { name: 'gender-category', params: { gender: String(query.gender), category: grandCategory.slug } },
          });
        }
      }

      if (parentCategory) {
        breadcrumbs.push({
          label: parentCategory.name,
          to: { name: 'gender-category', params: { gender: String(query.gender), category: parentCategory.slug } },
        });
      }
    }

    breadcrumbs.push({
      label: currentCategory.name,
      to: { name: 'gender-category', params: { gender: String(query.gender), category: currentCategory.slug } },
    });
  }

  // === 3) базовый SELECT по товарам
  let productsQuery = supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      brand_id,
      brand:brands(name),
      variants:product_variants(id, price, size, color),
      images:product_images(url, sort)
    `, { count: 'exact' })
    .eq('active', true);

  // фильтр по категории (с потомками) / гендеру
  if (categoryId) {
    // соберём self + всех потомков категории (любой глубины) в рамках того же gender_id
    const { data: allCategories, error: allCategoriesError } = await supabase
      .from('categories')
      .select('id, parent_id')
      .eq('gender_id', categoryGenderId as number);

    if (allCategoriesError) {
      throw createError({ statusCode: 500, statusMessage: allCategoriesError.message });
    }

    const childrenByParent = new Map<number | 'root', number[]>();

    for (const cat of allCategories || []) {
      const key = (cat.parent_id ?? 'root') as number | 'root';

      if (!childrenByParent.has(key)) {
        childrenByParent.set(key, []);
      }

      childrenByParent.get(key)!.push(cat.id);
    }

    const collectedIds = new Set<number>([categoryId]);
    const queue: number[] = [categoryId];

    while (queue.length) {
      const current = queue.shift()!;
      const children = childrenByParent.get(current) || [];

      for (const childId of children) {
        if (!collectedIds.has(childId)) {
          collectedIds.add(childId);
          queue.push(childId);
        }
      }
    }

    productsQuery = productsQuery.in('primary_category_id', Array.from(collectedIds));
  } else if (genderId) {
    // все категории данного гендера
    const { data: genderCategories, error: genderCategoriesError } = await supabase
      .from('categories')
      .select('id')
      .eq('gender_id', genderId);

    if (genderCategoriesError) {
      throw createError({ statusCode: 500, statusMessage: genderCategoriesError.message });
    }

    const genderCategoryIds = (genderCategories || []).map(c => c.id);

    if (!genderCategoryIds.length) {
      return { items: [], total: 0, page, limit, breadcrumbs };
    }

    productsQuery = productsQuery.in('primary_category_id', genderCategoryIds);
  }

  // === 4) текстовый поиск
  if (query.q) {
    productsQuery = productsQuery.ilike('title', `%${query.q}%`);
  }

  // === 5) бренд
  if (query.brand_id) {
    productsQuery = productsQuery.eq('brand_id', query.brand_id);
  } else if (query.brand_slug) {
    const { data: brandRow } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', String(query.brand_slug))
      .maybeSingle();

    if (brandRow?.id) {
      productsQuery = productsQuery.eq('brand_id', brandRow.id);
    }
  }

  // === 6) фильтры по вариантам
  if (query.size) {
    productsQuery = productsQuery.eq('product_variants.size', query.size);
  }

  if (query.color) {
    productsQuery = productsQuery.eq('product_variants.color', query.color);
  }

  if (query.min_price) {
    productsQuery = productsQuery.gte('product_variants.price', Number(query.min_price));
  }

  if (query.max_price) {
    productsQuery = productsQuery.lte('product_variants.price', Number(query.max_price));
  }

  // === 7) сортировка
  switch (query.sort) {
    case 'price_asc':
      productsQuery = productsQuery.order('product_variants.price', { ascending: true });
      break;
    case 'price_desc':
      productsQuery = productsQuery.order('product_variants.price', { ascending: false });
      break;
    case 'new':
      productsQuery = productsQuery.order('id', { ascending: false });
      break;
    default:
      productsQuery = productsQuery.order('id', { ascending: true });
      break;
  }

  // === 8) пагинация
  productsQuery = productsQuery.range(rangeFrom, rangeTo);

  const { data: productRows, count: totalCount, error: listError } = await productsQuery;

  if (listError) {
    throw createError({ statusCode: 500, statusMessage: listError.message });
  }

  // === 9) нормализация результата под единый формат items
  const items = (productRows || []).map((product: any) => {
    const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
    const imagesArray = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []);
    const sortedImages = imagesArray.sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0));

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand_name: product.brand?.name ?? null,
      price: firstVariant?.price ?? 0, // integer AOA
      variant_id: firstVariant?.id ?? null, // для корзины/заказа
      size: firstVariant?.size ?? null,
      color: firstVariant?.color ?? null,
      images: sortedImages,
    };
  });

  return {
    items,
    total: totalCount || 0,
    page,
    limit,
    breadcrumbs,
  };
});
