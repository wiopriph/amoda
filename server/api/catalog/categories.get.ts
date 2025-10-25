import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  gender_id: number
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { gender } = getQuery(event) as { gender?: string };

  if (!gender) {
    throw createError({ statusCode: 400, statusMessage: 'gender is required' });
  }

  const { data: genderRow, error: genderError } = await supabase
    .from('genders')
    .select('id, code')
    .eq('code', String(gender))
    .maybeSingle();

  if (genderError) {
    throw createError({ statusCode: 500, statusMessage: genderError.message });
  }

  if (!genderRow?.id) {
    throw createError({ statusCode: 404, statusMessage: 'Gender not found' });
  }

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

  const childrenByParent = new Map<number | 'root', CategoryRow[]>();

  for (const category of categoryRows as CategoryRow[]) {
    const parentKey = (category.parent_id ?? 'root') as number | 'root';

    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }

    childrenByParent.get(parentKey)?.push(category);
  }

  const buildTree = (parentKey: number | 'root' = 'root') =>
    (childrenByParent.get(parentKey) || []).map(node => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      parent_id: node.parent_id,
      children: buildTree(node.id),
    }));

  return buildTree('root');
});
