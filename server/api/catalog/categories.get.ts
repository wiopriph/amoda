import { serverSupabaseClient } from '#supabase/server';


export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { gender } = getQuery(event) as { gender?: string };

  if (!gender) {
    return []; // можно кинуть 400, но для MVP вернём пусто
  }

  // 1) Найти gender_id по коду (women|men|kids)
  const { data: genderRow, error: genderError } = await supabase
    .from('genders')
    .select('id, code')
    .eq('code', String(gender))
    .maybeSingle();

  if (genderError) {
    throw createError({ statusCode: 500, statusMessage: genderError.message });
  }

  if (!genderRow?.id) {
    return [];
  }

  // 2) Вытащить категории этого гендера
  const { data: categoryRows, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, gender_id')
    .eq('gender_id', genderRow.id)
    .order('name', { ascending: true });

  if (categoriesError) {
    throw createError({ statusCode: 500, statusMessage: categoriesError.message });
  }

  if (!categoryRows?.length) {
    return [];
  }

  // 3) Построить дерево
  const childrenByParent: Record<string | number, any[]> = {};

  for (const category of categoryRows) {
    const key = category.parent_id ?? 'root';

    if (!childrenByParent[key]) {
      childrenByParent[key] = [];
    }

    childrenByParent[key].push(category);
  }

  const buildTree = (parentKey: number | 'root' = 'root') =>
    (childrenByParent[parentKey] || []).map(node => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      parent_id: node.parent_id,
      children: buildTree(node.id),
    }));

  return buildTree('root');
});
